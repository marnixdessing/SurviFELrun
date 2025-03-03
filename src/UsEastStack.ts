import { Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, ZoneDelegationRecord } from 'aws-cdk-lib/aws-route53';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class UsEastStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const accountHosedzoneId = StringParameter.valueForStringParameter(this, Statics.accountHostedzoneId);
    const accountHosedzoneName = StringParameter.valueForStringParameter(this, Statics.accountHostedzoneName);
    const accountHostedzone = HostedZone.fromHostedZoneAttributes(this, 'account-hostedzone', {
      hostedZoneId: accountHosedzoneId,
      zoneName: accountHosedzoneName,
    });

    const hostedzone = new HostedZone(this, 'hostedzone', {
      zoneName: `survifelrun.${accountHosedzoneName}`,
      comment: 'Hosted zone for hosting the survifelrun website',
    });

    const certificate = new Certificate(this, 'certificate', {
      domainName: hostedzone.zoneName,
      validation: CertificateValidation.fromDns(hostedzone),
    });

    if (!hostedzone.hostedZoneNameServers) {
      throw Error('Expected name servers to be set');
    }

    new ZoneDelegationRecord(this, 'zone-delegation', {
      zone: accountHostedzone,
      nameServers: hostedzone.hostedZoneNameServers,
      recordName: hostedzone.zoneName,
    });

    new StringParameter(this, 'hostedzone-id', {
      stringValue: hostedzone.hostedZoneId,
      parameterName: Statics.projectHostedzoneId,
    });

    new StringParameter(this, 'hostedzone-name', {
      stringValue: hostedzone.zoneName,
      parameterName: Statics.projectHostedzoneName,
    });

    new StringParameter(this, 'certificate-arn', {
      stringValue: certificate.certificateArn,
      parameterName: Statics.projectCertificateArn,
    });

  }
}