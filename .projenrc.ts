import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'SurviFELrun',
  projenrcTs: true,
  deps: [
    'cdk-remote-stack',
    'mustache',
    '@types/mustache',
  ],
  gitignore: [
    '.DS_Store',
    'dist'
  ]
});
project.synth();