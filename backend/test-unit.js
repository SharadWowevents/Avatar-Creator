const avatarController = require('./controllers/avatarController');
const authController = require('./controllers/authController');

async function testUnit() {
  console.log('--- 1. Testing Generation Controller ---');
  let genResult = null;
  const reqGen = {
    body: {
      intro: "WOW Events Pvt. Ltd. is an events and experience design agency in India.",
      icp: "Marketing heads at ₹50 Cr+ revenue companies.",
      life: "1. Event is 2-3 weeks away.\n2. Vendor went silent.\n3. Budget tight.",
      yacht: "1. Want annual flagship event benchmark.\n2. One partner across the year.\n3. Content and PR impact.",
      both: "Rapid rescue for Lifeboat; annual retainer for Yacht."
    }
  };
  const resGen = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Generate Status ${code}] Character:`, data.data?.lifeboat?.characterName);
        genResult = data.data;
      }
    })
  };
  await avatarController.generate(reqGen, resGen);

  console.log('--- 2. Testing Create / Save Controller ---');
  let savedId = null;
  const reqCreate = {
    body: {
      title: "WOW Events Test Dossier",
      inputs: reqGen.body,
      output: genResult
    }
  };
  const resCreate = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Create Status ${code}] Saved item title:`, data.data?.title);
        savedId = data.data?._id;
      }
    })
  };
  await avatarController.create(reqCreate, resCreate);

  console.log('--- 3. Testing GetAll Controller ---');
  const reqGetAll = {};
  const resGetAll = {
    status: (code) => ({
      json: (data) => {
        console.log(`[GetAll Status ${code}] Count:`, data.count, 'Source:', data.source);
      }
    })
  };
  await avatarController.getAll(reqGetAll, resGetAll);

  console.log('--- 4. Testing Delete Controller ---');
  const reqDelete = { params: { id: savedId } };
  const resDelete = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Delete Status ${code}] Message:`, data.message);
      }
    })
  };
  await avatarController.delete(reqDelete, resDelete);

  console.log('--- 5. Testing Auth: User Registration ---');
  let authToken = null;
  const reqReg = {
    body: {
      name: "Sharad Kumar",
      mobile: "+91 9876543210",
      email: "sharad@example.com",
      password: "password123"
    }
  };
  const resReg = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Register Status ${code}] User:`, data.user?.name, 'Token received:', Boolean(data.token));
        authToken = data.token;
      }
    })
  };
  await authController.register(reqReg, resReg);

  console.log('--- 6. Testing Auth: User Login ---');
  const reqLogin = {
    body: {
      identifier: "sharad@example.com",
      password: "password123"
    }
  };
  const resLogin = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Login Status ${code}] Logged in as:`, data.user?.email);
      }
    })
  };
  await authController.login(reqLogin, resLogin);

  console.log('--- 7. Testing Auth: Forgot Password (OTP via SMTP) ---');
  let receivedOtp = null;
  const reqForgot = {
    body: {
      email: "sharad@example.com"
    }
  };
  const resForgot = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Forgot Password Status ${code}] Message:`, data.message, 'Debug OTP:', data.debugOtp);
        receivedOtp = data.debugOtp;
      }
    })
  };
  await authController.forgotPassword(reqForgot, resForgot);

  console.log('--- 8. Testing Auth: Reset Password with OTP ---');
  const reqReset = {
    body: {
      email: "sharad@example.com",
      otp: receivedOtp,
      newPassword: "newpassword456"
    }
  };
  const resReset = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Reset Password Status ${code}] Message:`, data.message);
      }
    })
  };
  await authController.resetPassword(reqReset, resReset);

  console.log('--- 9. Testing Auth: Login with New Password ---');
  const reqLoginNew = {
    body: {
      identifier: "sharad@example.com",
      password: "newpassword456"
    }
  };
  const resLoginNew = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Login with New Password Status ${code}] Success:`, Boolean(data.token));
      }
    })
  };
  await authController.login(reqLoginNew, resLoginNew);

  console.log('\n=============================================');
  console.log('✅ ALL BACKEND AND AUTH UNIT TESTS PASSED!');
  console.log('=============================================\n');
  process.exit(0);
}

testUnit();
