// @ts-check

const getEnvModule = require('./env');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

getEnvModule().setEnvironmentVarsFromTestEnv(__dirname);

process.env.CLIENT_ID = process.env.SPA_CLIENT_ID || process.env.CLIENT_ID;

const allEnvKeys = [
  'ISSUER',
  'CLIENT_ID',
  'OKTA_TESTING_DISABLEHTTPSCHECK',
  'USE_INTERACTION_CODE',
];
const requiredEnvKeys = [
  'ISSUER',
  'CLIENT_ID',
];

allEnvKeys.forEach((key) => {
  if (!process.env[key] && requiredEnvKeys.includes(key)) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  process.env[`NEXT_PUBLIC_${key}`] = process.env[key];
});

module.exports = nextConfig;
