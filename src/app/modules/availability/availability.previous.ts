import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { isOverlap } from "../../../helpers/isOverlap";

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

interface SlotInput {
  startTime: string;
  endTime: string;
  breakTime?: {
    startTime: string;
    endTime: string;
  };
}
interface AvailabilityInput {
  dayOfWeek: number;
  slots: SlotInput[];
}

function parseSlotToTime(time: string) {
  return dayjs(time, "hh:mm A").format("hh:mm A");
}

function parseTimeFlexible(time: string) {
  if (!time && time !== "") {
    throw new ApiError(400, "Invalid time format");
  }

  const formats = ["hh:mm A", "H:mm", "HH:mm", "h:mm A", "hh:mm"];
  for (const fmt of formats) {
    const parsed = dayjs(time as string, fmt, true);
    if (parsed.isValid()) return parsed.format("hh:mm A");
  }

  // try non-strict parsing as last resort
  const parsedLoose = dayjs(time as string);
  if (parsedLoose.isValid()) return parsedLoose.format("hh:mm A");

  throw new ApiError(400, "Invalid time format. Use hh:mm AM/PM or HH:mm");
}

function parseBoolField(v: any, defaultVal = true) {
  if (v === undefined || v === null) return defaultVal;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "1") return true;
    if (s === "0") return false;
  }
  return Boolean(v);
}

function validateTimeRange(
  startTime: string,
  endTime: string,
  message: string,
) {
  const start = dayjs(startTime, "hh:mm A", true);
  const end = dayjs(endTime, "hh:mm A", true);

  if (!start.isValid() || !end.isValid()) {
    throw new ApiError(400, `${message}: invalid time format. Use hh:mm AM/PM`);
  }

  if (!start.isBefore(end)) {
    throw new ApiError(400, `${message}: startTime must be before endTime`);
  }

  return {
    start: parseSlotToTime(startTime),
    end: parseSlotToTime(endTime),
  };
}

function normalizeSlot(slot: SlotInput) {
  const normalizedSlot = validateTimeRange(
    slot.startTime,
    slot.endTime,
    "Invalid slot time range",
  );

  let breakStartTime: string | null = null;
  let breakEndTime: string | null = null;

  if (slot.breakTime) {
    const normalizedBreak = validateTimeRange(
      slot.breakTime.startTime,
      slot.breakTime.endTime,
      "Invalid breakTime range",
    );

    if (
      !isOverlap(
        normalizedBreak.start,
        normalizedBreak.end,
        normalizedSlot.start,
        normalizedSlot.end,
      )
    ) {
      throw new ApiError(400, "breakTime must be within slot time range");
    }

    if (
      normalizedBreak.start === normalizedSlot.start ||
      normalizedBreak.end === normalizedSlot.end
    ) {
      throw new ApiError(400, "breakTime must be fully inside slot time range");
    }

    breakStartTime = normalizedBreak.start;
    breakEndTime = normalizedBreak.end;
  }

  return {
    startTime: normalizedSlot.start,
    endTime: normalizedSlot.end,
    breakStartTime,
    breakEndTime,
  };
}

const createUserAvailability = async (
  workerId: string,
  availability: AvailabilityInput[],
) => {
  return prisma.$transaction(
    async (tx) => {
      await tx.availability.deleteMany({ where: { workerId } });

      const daySet = new Set<number>();

      const results = [];
      for (const day of availability) {
        if (daySet.has(day.dayOfWeek)) {
          throw new ApiError(
            400,
            `Duplicate dayOfWeek ${day.dayOfWeek} is not allowed`,
          );
        }

        daySet.add(day.dayOfWeek);

        if (!Array.isArray(day.slots) || day.slots.length !== 1) {
          throw new ApiError(400, "Only one slot is allowed per day");
        }

        const normalizedSlot = normalizeSlot(day.slots[0]);

        const result = await tx.availability.create({
          data: {
            workerId,
            dayOfWeek: day.dayOfWeek,
            slots: {
              create: normalizedSlot,
            },
          },
        });
        results.push(result);
      }

      return results;
    },
    { timeout: 20000 },
  );
};

const getExpertDayiWseSlotsFromDB = async (
  userId: string,
  dayOfWeek: number,
  date: string,
  serviceId: string,
) => {
  if (
    !userId ||
    dayOfWeek === undefined ||
    dayOfWeek === null ||
    !date ||
    !serviceId
  ) {
    throw new ApiError(
      400,
      "providerId, day, date, and serviceId are required",
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  const offer = service
    ? null
    : await prisma.offer.findFirst({ where: { id: serviceId } });

  if (!service && !offer) {
    throw new ApiError(404, "Service or offer not found");
  }

  const slotCount = service
    ? Math.max(1, service.totalProvider || 1)
    : Math.max(1, offer?.maxBookingsPerHour || 1);

  const normalizedDuration = service
    ? service.duration?.replace(/\s+/g, "").toLowerCase()
    : "1h";

  const durationMatch = normalizedDuration?.match(
    /^((\d+)h:?)?((\d+)(?:m)?)?$/,
  );
  if (!durationMatch || (!durationMatch[2] && !durationMatch[4])) {
    throw new ApiError(400, "Invalid service duration format");
  }

  const durationHours = Number(durationMatch[2] || 0);
  const durationMinutes = Number(durationMatch[4] || 0);
  const slotDurationInMinutes = durationHours * 60 + durationMinutes;

  if (slotDurationInMinutes <= 0) {
    throw new ApiError(400, "Service duration must be greater than 0 minutes");
  }

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new ApiError(400, "day must be an integer between 0 and 6");
  }

  const targetDate = dayjs(date, "YYYY-MM-DD", true).startOf("day");
  if (!targetDate.isValid()) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }
  if (targetDate.day() !== dayOfWeek) {
    throw new ApiError(400, "Provided day does not match the provided date");
  }

  const targetDateStr = targetDate.format("YYYY-MM-DD");

  // Determine behaviour flags and product fields
  const product: any = service || offer;
  const useWorkingHours = parseBoolField(product.useWorkingHours, true);
  const useServiceHours = parseBoolField(product.useServiceHours, true);

  // If useWorkingHours is false, ensure the target date exists in product.workingDays
  if (useWorkingHours === false) {
    const workingDays = product.workingDays as any[] | undefined;
    // Only enforce when workingDays is provided and non-empty
    if (Array.isArray(workingDays) && workingDays.length > 0) {
      const found = workingDays.some((wd) => {
        if (!wd) return false;
        const parsed = dayjs(
          wd,
          ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
          true,
        );
        if (parsed.isValid())
          return parsed.format("YYYY-MM-DD") === targetDateStr;
        // try loose parse
        const loose = dayjs(wd);
        return loose.isValid() && loose.format("YYYY-MM-DD") === targetDateStr;
      });

      if (!found) return [];
    }
  }

  // Build availabilities: either from DB (when useServiceHours === true) or from product start/end times
  let availabilities: any[] = [];
  if (useServiceHours === false) {
    if (!product.startTime || !product.endTime) return [];
    let serviceStart: string;
    let serviceEnd: string;
    try {
      serviceStart = parseTimeFlexible(product.startTime);
      serviceEnd = parseTimeFlexible(product.endTime);
    } catch (err) {
      return [];
    }

    availabilities = [
      {
        slots: [
          {
            startTime: serviceStart,
            endTime: serviceEnd,
          },
        ],
      },
    ];
  } else {
    availabilities = await prisma.availability.findMany({
      where: { workerId: userId, dayOfWeek },
      include: { slots: true },
    });

    if (!availabilities.length) return [];
  }

  const now = dayjs();
  const dayStart = new Date(`${targetDateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${targetDateStr}T23:59:59.999Z`);

  const bookings = await prisma.booking.findMany({
    where: {
      providerId: userId,
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  const bookedRanges = bookings.map((b: any) => {
    const start = dayjs(
      `${targetDateStr} ${b.time}`,
      "YYYY-MM-DD hh:mm A",
      true,
    );
    return { start, end: start.add(slotDurationInMinutes, "minute") };
  });

  const slotsWithAvailability: {
    start: string;
    end: string;
    isAvailable: boolean;
  }[] = [];

  for (const availability of availabilities) {
    for (const slot of availability.slots) {
      const parsedStart = dayjs(
        slot.startTime,
        ["hh:mm A", "HH:mm", "H:mm"],
        true,
      );
      const parsedEnd = dayjs(slot.endTime, ["hh:mm A", "HH:mm", "H:mm"], true);

      if (!parsedStart.isValid() || !parsedEnd.isValid()) continue;

      let cursor = targetDate
        .hour(parsedStart.hour())
        .minute(parsedStart.minute())
        .second(0)
        .millisecond(0);
      const slotEnd = targetDate
        .hour(parsedEnd.hour())
        .minute(parsedEnd.minute())
        .second(0)
        .millisecond(0);

      while (
        cursor.add(slotDurationInMinutes, "minute").isSameOrBefore(slotEnd)
      ) {
        const blockStart = cursor;
        const blockEnd = cursor.add(slotDurationInMinutes, "minute");

        if (targetDate.isSame(now, "day") && blockEnd.isBefore(now)) {
          cursor = cursor.add(slotDurationInMinutes, "minute");
          continue;
        }

        const bookedCount = bookedRanges.filter(
          (br) => blockStart.isBefore(br.end) && blockEnd.isAfter(br.start),
        ).length;
        const unavailableCount = Math.min(bookedCount, slotCount);

        for (let index = 0; index < slotCount; index += 1) {
          slotsWithAvailability.push({
            start: blockStart.format("hh:mm A"),
            end: blockEnd.format("hh:mm A"),
            isAvailable: index >= unavailableCount,
          });
        }

        cursor = cursor.add(slotDurationInMinutes, "minute");
      }
    }
  }

  return slotsWithAvailability;
};

const getExpertsAllSlotsFromDB = async (workerId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: workerId, role: "Provider" },
  });

  const availabilities = await prisma.availability.findMany({
    where: { workerId },
    select: {
      id: true,
      dayOfWeek: true,
      slots: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          breakStartTime: true,
          breakEndTime: true,
        },
      },
    },
  });

  const organized = availabilities.reduce((acc: any, curr) => {
    const dayIndex = acc.findIndex((d: any) => d.dayOfWeek === curr.dayOfWeek);

    const slotsWithAvailabilityId = curr.slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      breakTime:
        slot.breakStartTime && slot.breakEndTime
          ? {
              startTime: slot.breakStartTime,
              endTime: slot.breakEndTime,
            }
          : null,
      availabilityId: curr.id,
    }));

    if (dayIndex > -1) {
      acc[dayIndex].slots.push(...slotsWithAvailabilityId);
    } else {
      acc.push({
        dayOfWeek: curr.dayOfWeek,
        slots: slotsWithAvailabilityId,
      });
    }
    return acc;
  }, []);

  return organized;
};

const getUserAvailabilityFromDB = async (workerId: string) => {
  const availability = await prisma.availability.findMany({
    where: { workerId },
    include: { slots: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return availability.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    slots: day.slots.map((s) => ({
      startTime: parseSlotToTime(s.startTime),
      endTime: parseSlotToTime(s.endTime),
      breakTime:
        s.breakStartTime && s.breakEndTime
          ? {
              startTime: parseSlotToTime(s.breakStartTime),
              endTime: parseSlotToTime(s.breakEndTime),
            }
          : null,
    })),
  }));
};

const deleteSlotFromDB = async (id: string) => {
  const slot = await prisma.availability.findUniqueOrThrow({
    where: { id },
  });
  // const expertsDaySlotCount = await prisma.availability.count({
  //   where: { providerId: slot.providerId, dayOfWeek: slot.dayOfWeek },
  // });

  // if (expertsDaySlotCount < 2) {
  //   throw new ApiError(
  //     400,
  //     "This slot cannot be deleted. At least one slots must remain for this day."
  //   );
  // }
  await prisma.availability.delete({
    where: { id },
  });
  return;
};

const updateSlotFromDB = async (id: string, payload: SlotInput) => {
  const normalizedPayload = normalizeSlot(payload);

  const slot = await prisma.availableSlot.findUniqueOrThrow({
    where: { id },
    include: {
      availability: true,
    },
  });

  const currentSlots = await prisma.availability.findMany({
    where: {
      dayOfWeek: slot.availability.dayOfWeek,
      workerId: slot.availability.workerId,
    },
    include: {
      slots: {
        select: { id: true, startTime: true, endTime: true },
      },
    },
  });

  const allSlots = currentSlots.flatMap((a) => a.slots);

  for (const existing of allSlots) {
    if (existing.id === id) continue;

    if (
      isOverlap(
        normalizedPayload.startTime,
        normalizedPayload.endTime,
        existing.startTime,
        existing.endTime,
      )
    ) {
      throw new Error(
        `Time conflict: overlaps with existing slot ${existing.startTime} - ${existing.endTime}`,
      );
    }
  }

  await prisma.availableSlot.update({
    where: { id },
    data: {
      startTime: normalizedPayload.startTime,
      endTime: normalizedPayload.endTime,
      breakStartTime: normalizedPayload.breakStartTime,
      breakEndTime: normalizedPayload.breakEndTime,
    },
  });

  return;
};

const addNewSlotIntoDB = async (workerId: string, payload: any) => {
  return await prisma.$transaction(async (tx) => {
    await tx.user.findUniqueOrThrow({
      where: { id: workerId, role: "Provider" },
    });

    const normalizedPayload = normalizeSlot(payload);

    const availabilities = await tx.availability.findMany({
      where: {
        workerId,
        dayOfWeek: payload.dayOfWeek,
      },
      include: { slots: true },
    });

    const existingSlotsForDay = availabilities.flatMap((a) => a.slots);
    if (existingSlotsForDay.length > 0) {
      throw new ApiError(400, "Only one slot is allowed per day");
    }

    for (const availability of availabilities) {
      for (const existing of availability.slots) {
        if (
          isOverlap(
            normalizedPayload.startTime,
            normalizedPayload.endTime,
            existing.startTime,
            existing.endTime,
          )
        ) {
          throw new ApiError(
            400,
            `Time conflict: overlaps with existing slot ${existing.startTime} - ${existing.endTime}`,
          );
        }
      }
    }

    const availabilityForNewSlot =
      availabilities[0] ||
      (await tx.availability.create({
        data: {
          dayOfWeek: payload.dayOfWeek,
          workerId,
        },
        include: { slots: true },
      }));

    await tx.availableSlot.create({
      data: {
        startTime: normalizedPayload.startTime,
        endTime: normalizedPayload.endTime,
        breakStartTime: normalizedPayload.breakStartTime,
        breakEndTime: normalizedPayload.breakEndTime,
        availabilityId: availabilityForNewSlot.id,
      },
    });

    return;
  });
};

export const availabilityServices = {
  createUserAvailability,
  addNewSlotIntoDB,
  getUserAvailabilityFromDB,
  getExpertDayiWseSlotsFromDB,
  updateSlotFromDB,
  deleteSlotFromDB,
  getExpertsAllSlotsFromDB,
};

