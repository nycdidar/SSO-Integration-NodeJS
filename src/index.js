/**
 * SSO INTERGRATION
 */
import https from 'https';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import saml from 'passport-saml';
import fs from 'fs';


// Saml Configurations
const samlConfig = {
  issuer: "saml-poc",
  entityId: "example_sso",
  callbackUrl: "https://localhost/sso/callback",
  signOut: "https://localhost/signout/callback",
  entryPoint: "https://localhost:8443/simplesaml/saml2/idp/SSOService.php",
  certFolder: "certs"
};

// Only for https server
const https_cert = fs.readFileSync(__dirname + '/' + samlConfig.certFolder + '/cert.pem', 'utf-8');
const https_pvk = fs.readFileSync(__dirname + '/' + samlConfig.certFolder + '/key.pem', 'utf-8');

//  from idp's metadata
const idp_cert_1 = 'MIIDXTCCAkWgAwIBAgIJALmVVuDWu4NYMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMTYxMjMxMTQzNDQ3WhcNNDgwNjI1MTQzNDQ3WjBFMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzUCFozgNb1h1M0jzNRSCjhOBnR+uVbVpaWfXYIR+AhWDdEe5ryY+CgavOg8bfLybyzFdehlYdDRgkedEB/GjG8aJw06l0qF4jDOAw0kEygWCu2mcH7XOxRt+YAH3TVHa/Hu1W3WjzkobqqqLQ8gkKWWM27fOgAZ6GieaJBN6VBSMMcPey3HWLBmc+TYJmv1dbaO2jHhKh8pfKw0W12VM8P1PIO8gv4Phu/uuJYieBWKixBEyy0lHjyixYFCR12xdh4CA47q958ZRGnnDUGFVE1QhgRacJCOZ9bd5t9mr8KLaVBYTCJo5ERE8jymab5dPqe5qKfJsCZiqWglbjUo9twIDAQABo1AwTjAdBgNVHQ4EFgQUxpuwcs/CYQOyui+r1G+3KxBNhxkwHwYDVR0jBBgwFoAUxpuwcs/CYQOyui+r1G+3KxBNhxkwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAAiWUKs/2x/viNCKi3Y6blEuCtAGhzOOZ9EjrvJ8+COH3Rag3tVBWrcBZ3/uhhPq5gy9lqw4OkvEws99/5jFsX1FJ6MKBgqfuy7yh5s1YfM0ANHYczMmYpZeAcQf2CGAaVfwTTfSlzNLsF2lW/ly7yapFzlYSJLGoVE+OHEu8g5SlNACUEfkXw+5Eghh+KzlIN7R6Q7r2ixWNFBC/jWf7NKUfJyX8qIG5md1YUeT6GBW9Bm2/1/RiO24JTaYlfLdKK9TYb8sG5B+OLab2DImG99CJ25RkAcSobWNF5zD0O6lgOo3cEdB/ksCq3hmtlC/DlLZ/D8CJ+7VuZnS1rR2naQ==';
const idp_cert_2 = 'MIIDXTCCAkWgAwIBAgIJALmVVuDWu4NYMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMTYxMjMxMTQzNDQ3WhcNNDgwNjI1MTQzNDQ3WjBFMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzUCFozgNb1h1M0jzNRSCjhOBnR+uVbVpaWfXYIR+AhWDdEe5ryY+CgavOg8bfLybyzFdehlYdDRgkedEB/GjG8aJw06l0qF4jDOAw0kEygWCu2mcH7XOxRt+YAH3TVHa/Hu1W3WjzkobqqqLQ8gkKWWM27fOgAZ6GieaJBN6VBSMMcPey3HWLBmc+TYJmv1dbaO2jHhKh8pfKw0W12VM8P1PIO8gv4Phu/uuJYieBWKixBEyy0lHjyixYFCR12xdh4CA47q958ZRGnnDUGFVE1QhgRacJCOZ9bd5t9mr8KLaVBYTCJo5ERE8jymab5dPqe5qKfJsCZiqWglbjUo9twIDAQABo1AwTjAdBgNVHQ4EFgQUxpuwcs/CYQOyui+r1G+3KxBNhxkwHwYDVR0jBBgwFoAUxpuwcs/CYQOyui+r1G+3KxBNhxkwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAAiWUKs/2x/viNCKi3Y6blEuCtAGhzOOZ9EjrvJ8+COH3Rag3tVBWrcBZ3/uhhPq5gy9lqw4OkvEws99/5jFsX1FJ6MKBgqfuy7yh5s1YfM0ANHYczMmYpZeAcQf2CGAaVfwTTfSlzNLsF2lW/ly7yapFzlYSJLGoVE+OHEu8g5SlNACUEfkXw+5Eghh+KzlIN7R6Q7r2ixWNFBC/jWf7NKUfJyX8qIG5md1YUeT6GBW9Bm2/1/RiO24JTaYlfLdKK9TYb8sG5B+OLab2DImG99CJ25RkAcSobWNF5zD0O6lgOo3cEdB/ksCq3hmtlC/DlLZ/D8CJ+7VuZnS1rR2naQ==';

passport.serializeUser(function (user, done) {
  console.log('-----------------------------');
  console.log('serialize user');
  console.log(user);
  console.log('-----------------------------');
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  console.log('-----------------------------');
  console.log('deserialize user');
  console.log(user);
  console.log('-----------------------------');
  done(null, user);
});

const samlStrategy = new saml.Strategy({
  callbackUrl: samlConfig.callbackUrl,
  entryPoint: samlConfig.entryPoint,
  issuer: samlConfig.issuer,
  identifierFormat: null,
  decryptionPvk: https_pvk,
  cert: [idp_cert_1, idp_cert_2],
  privateCert: fs.readFileSync(__dirname + '/' + samlConfig.certFolder + '/key.pem', 'utf8'),
  validateInResponseTo: true,
  disableRequestedAuthnContext: true,

}, (profile, done) => {
  console.log('passport.use() profile: %s \n', JSON.stringify(profile));
  return done(null, profile);
});


const app = express();
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

passport.use('samlStrategy', samlStrategy);
app.use(passport.initialize({}));
app.use(passport.session({}));


app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.get('/',
  (req, res) => {
    res.send('Test Home Page');
  }
);

app.get('/login',
  (req, res, next) => {
    console.log('-----------------------------');
    console.log('/Start login handler');
    next();
  },
  passport.authenticate('samlStrategy'),
);

app.post('/sso/callback',
 (req, res, next) => {
    console.log('/Start login callback ');
    next();
  },
  passport.authenticate('samlStrategy'),
  (req, res) => {
     console.log("/SSO payload");
    console.log(req.user);
    res.send(req.user);
  }
);

app.get('/metadata',
 (req, res) => {
    res.type('application/xml');
    // Use Certificate
   res.status(200).send((saml_strategy.generateServiceProviderMetadata(https_cert)));
  }
);

// if https server
const server = https.createServer({
  'key': https_pvk,
  'cert': https_cert
}, app).listen(4300, () => {
  console.log('Listening on https://localhost:%d', server.address().port)
});





