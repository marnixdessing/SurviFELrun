import { Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, Distribution, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { AaaaRecord, ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { RemoteParameters } from 'cdk-remote-stack';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class MainStack extends Stack {

  private websiteBucket: Bucket;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    this.websiteBucket = this.setupWebsiteBucket();

    const remoteParams = this.getParametersFromUsEast1();
    const certificate = this.importCertificate(remoteParams);
    const hostedzone = this.importHostedzone(remoteParams);

    // Cloudfront
    const cloudfront = this.setupCloudfront(certificate, hostedzone.zoneName);
    this.addDnsRecords(cloudfront, hostedzone);
  }

  private setupWebsiteBucket() {
    const bucket = new Bucket(this, 'website-bucket', {
      enforceSSL: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    return bucket;
  }

  private getParametersFromUsEast1() {
    return new RemoteParameters(this, 'remote-ssm', {
      path: Statics.projectSsmPath,
      region: 'us-east-1',
      alwaysUpdate: false,
    });
  }

  private importCertificate(remoteParams: RemoteParameters) {
    const arn = remoteParams.get(Statics.projectCertificateArn);
    return Certificate.fromCertificateArn(this, 'certificate', arn);
  }

  private importHostedzone(remoteParams: RemoteParameters) {
    const name = remoteParams.get(Statics.projectHostedzoneName);
    const id = remoteParams.get(Statics.projectHostedzoneId);
    return HostedZone.fromHostedZoneAttributes(this, 'hostedzone', {
      hostedZoneId: id,
      zoneName: name,
    });
  }


  setupCloudfront(certificate: ICertificate, domainName: string): Distribution {
    const distribution = new Distribution(this, 'distribution', {
      priceClass: PriceClass.PRICE_CLASS_100,
      domainNames: [domainName],
      certificate: certificate,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      },
      errorResponses: this.errorResponses(),
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultRootObject: 'index.html',
    });

    this.websiteBucket.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [
        new ServicePrincipal('cloudfront.amazonaws.com')
      ],
      actions: [
        's3:GetObject'
      ],
      resources: [
        this.websiteBucket.bucketArn,
        this.websiteBucket.bucketArn + '/*',
      ],
      conditions: {
        "StringEquals": {
          "AWS:SourceArn": distribution.distributionArn,
        }
      }
    }));

    return distribution;
  }

  private errorResponses() {
    const errorCodes = [403, 404, 500, 503];
    return errorCodes.map(code => {
      return {
        httpStatus: code,
        responseHttpStatus: code,
        responsePagePath: '/error.html',
      };
    });
  }

  /**
   * Add DNS records for cloudfront to the Route53 Zone
   * Requests to the custom domain will correctly use cloudfront.
   * @param distribution the cloudfront distribution
   */
  addDnsRecords(distribution: Distribution, hostedzone: IHostedZone) {
    new ARecord(this, 'a-record', {
      zone: hostedzone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
    new AaaaRecord(this, 'aaaa-record', {
      zone: hostedzone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }

}