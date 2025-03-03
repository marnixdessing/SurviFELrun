import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'SurviFELrun',
  projenrcTs: true,
  deps: [
    'cdk-remote-stack',
  ],
  gitignore: [
    '.DS_Store'
  ]
});
project.synth();