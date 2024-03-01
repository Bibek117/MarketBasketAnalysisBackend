import nodemailer from 'nodemailer'

const sendMail =async (data) =>{
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_EMAIL_PASS,
      },
    });

    const mailOptions = {
        from : "MBA<angdelimbume@gmail.com>",
        to: data.recepEmail,
        subject :  data.subject,
        html : data.html
    };

    await  transporter.sendMail(mailOptions);

}

export { sendMail }