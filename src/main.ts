import { App } from 'aws-cdk-lib';
import { MainStack } from './MainStack';
import { Statics } from './Statics';
import { UsEastStack } from './UsEastStack';

const app = new App();

const useast = new UsEastStack(app, 'SurviFELrun-us-east-1', {
  env: {
    account: Statics.awsAccount.account,
    region: 'us-east-1',
  },
});

const main = new MainStack(app, 'SurviFELrun-stack', {
  env: Statics.awsAccount,
});

main.addDependency(useast, 'Cert and hosted zone must exist before creating main stack');

app.synth();