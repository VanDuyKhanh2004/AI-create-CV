import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

// Kiểm tra biến môi trường
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

// Cấu hình Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ googleId: profile.id });

    if (user) {
      try {
        // If existing Google user is not marked verified, mark and save.
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          await user.save();
        }
      } catch (err) {
        console.error('Error marking existing Google user as verified in passport:', err);
      }
      return done(null, user);
    }

        // Nếu chưa tồn tại, tạo user mới
        // Google users are considered verified because Google already verified the email
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          username: profile.emails?.[0].value.split("@")[0],
          profileImage: profile.photos?.[0].value,
          authProvider: "google",
          isEmailVerified: true,
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user để lưu vào session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user để lấy thông tin từ session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
