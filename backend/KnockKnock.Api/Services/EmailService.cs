using Resend;

namespace KnockKnock.Api.Services;

public class EmailService
{
    private readonly IResend _resend;
    private readonly IConfiguration _config;

    public EmailService(IResend resend, IConfiguration config)
    {
        _resend = resend;
        _config = config;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string toName, string confirmUrl)
    {
        var message = new EmailMessage();
        message.From = $"{_config["Email:FromName"]} <{_config["Email:FromAddress"]}>";
        message.To.Add(toEmail);
        message.Subject = "Bitte bestätige deine E-Mail-Adresse";
        message.HtmlBody = $"""
            <p>Hallo {toName},</p>
            <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
            <p><a href="{confirmUrl}">{confirmUrl}</a></p>
            <p>Viele Grüße,<br/>Knock Knock HR</p>
            """;

        await _resend.EmailSendAsync(message);
    }
}
