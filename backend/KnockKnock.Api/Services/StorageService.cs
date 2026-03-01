using Amazon.S3;
using Amazon.S3.Model;

namespace KnockKnock.Api.Services;

public class StorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;

    public StorageService(IConfiguration config)
    {
        var s3Config = new AmazonS3Config
        {
            ServiceURL = config["S3:ServiceUrl"],
            ForcePathStyle = true
        };
        _s3 = new AmazonS3Client(config["S3:AccessKey"], config["S3:SecretKey"], s3Config);
        _bucketName = config["S3:BucketName"]!;
    }

    public async Task<string> UploadAsync(string key, Stream stream, string contentType)
    {
        await _s3.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType
        });
        return key;
    }

    public string GetPresignedUrl(string key, int expiryMinutes = 15)
    {
        return _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Verb = HttpVerb.GET
        });
    }
}
