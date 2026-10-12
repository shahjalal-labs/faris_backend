const axios = require("axios");

const API_KEY = "FLYWcRoVwQdjz7dkV9l85D7X3uCED_fhF87gIrDm";

export const getObjects = async () => {
  try {
    const res = await axios.get("https://api.propstack.de/v1/units", {
      headers: {
        "X-API-KEY": API_KEY,
      },
      params: {
        status: 33423,
      },
    });
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};
