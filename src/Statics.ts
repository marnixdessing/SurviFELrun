export class Statics {

  static readonly projectName = 'survifelrun';

  static readonly awsAccount = {
    account: '779846790091',
    retion: 'eu-central-1',
  };

  static readonly accountHostedzoneId = '/account/hostedzone/id';
  static readonly accountHostedzoneName = '/account/hostedzone/name';


  static readonly projectSsmPath = `/${Statics.projectName}/`;
  static readonly projectHostedzoneId = `/${Statics.projectName}/hostedzone/id`;
  static readonly projectHostedzoneName = `/${Statics.projectName}/hostedzone/name`;
  static readonly projectCertificateArn = `/${Statics.projectName}/certificate/arn`;


}