using System.Net;
using System.Net.Mail;
using Resend;

namespace KnockKnock.Api.Services;

public class EmailService
{
    private readonly IResend _resend;
    private readonly IConfiguration _config;
    private readonly IHostEnvironment _env;

    public EmailService(IResend resend, IConfiguration config, IHostEnvironment env)
    {
        _resend = resend;
        _config = config;
        _env = env;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string toName, string confirmUrl)
    {
        var from = $"{_config["Email:FromName"]} <{_config["Email:FromAddress"]}>";
        var subject = "Bitte bestätige deine E-Mail-Adresse";
        var html = $"""
            <p>Hallo {toName},</p>
            <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
            <p><a href="{confirmUrl}">{confirmUrl}</a></p>
            <p>Viele Grüße,<br/>Knock Knock HR</p>
            """;

        if (_env.IsDevelopment())
        {
            using var smtp = new SmtpClient(_config["Smtp:Host"] ?? "localhost", int.Parse(_config["Smtp:Port"] ?? "1025"));
            smtp.EnableSsl = false;
            smtp.Credentials = new NetworkCredential();
            var mail = new MailMessage(from, toEmail, subject, html) { IsBodyHtml = true };
            await smtp.SendMailAsync(mail);
        }
        else
        {
            var message = new EmailMessage();
            message.From = from;
            message.To.Add(toEmail);
            message.Subject = subject;
            message.HtmlBody = html;
            await _resend.EmailSendAsync(message);
        }
    }
}
