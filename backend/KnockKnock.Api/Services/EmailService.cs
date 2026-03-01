using MailKit.Net.Smtp;
using MimeKit;

namespace KnockKnock.Api.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string toName, string confirmUrl)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_config["Email:FromName"], _config["Email:FromAddress"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Bitte bestätige deine E-Mail-Adresse";

        message.Body = new TextPart("html")
        {
            Text = $"""
                <p>Hallo {toName},</p>
                <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
                <p><a href="{confirmUrl}">{confirmUrl}</a></p>
                <p>Viele Grüße,<br/>Knock Knock HR</p>
                """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_config["Email:SmtpHost"], int.Parse(_config["Email:SmtpPort"]!), false);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
