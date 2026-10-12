// export const emailBody = (otp: string) => {
//   const html = `
//   <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
//     <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
      
//       <!-- Header -->
//       <div style="background-color: #E35314; padding: 20px; text-align: center;">
//         <h2 style="color: #fff; margin: 0;">Signin Verification</h2>
//       </div>

//       <!-- Body -->
//       <div style="padding: 30px; text-align: center;">
//         <p style="font-size: 16px; color: #E35314; margin-bottom: 20px;">
//           Hello</b>,
//         </p>
//         <p style="font-size: 16px; color: #555;">
//           Your verification code is:
//         </p>

//         <h1 style="color: #E35314; font-size: 36px; margin: 15px 0;">${otp}</h1>

//         <p style="font-size: 14px; color: #777;">
//           This OTP is valid for <b>5 minutes</b>. If you did not request this, you can safely ignore this email.
//         </p>
//       </div>

//       <!-- Footer -->
//       <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
//         &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
//       </div>
//     </div>
//   </div>
//   `;
//   return html;
// };
export const emailBody = (otp: string) => {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #14e36aff; padding: 20px; text-align: center;">
        <img src="https://nyc3.digitaloceanspaces.com/smtech-space/uploads/courses/class/cvUrl/1759315935316-mpinhqw67ze.png" alt="Company Logo" style="height: 100px; margin-bottom: 10px;" />
        <h2 style="color: #fff; margin: 0;">Signin Verification</h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px; text-align: center;">
        <p style="font-size: 16px; color: #E35314; margin-bottom: 20px;">
          Hello,
        </p>
        <p style="font-size: 16px; color: #555;">
          Your verification code is:
        </p>

        <h1 style="color: #E35314; font-size: 36px; margin: 15px 0;">${otp}</h1>

        <p style="font-size: 14px; color: #777;">
          This OTP is valid for <b>5 minutes</b>. If you did not request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </div>
  `;
  return html;
};




