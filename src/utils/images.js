// import { imagePath } from "./services";


const imagePath = import.meta.env.VITE_ASSETS_BASENAME;

export const imageURL = {
  login: `${imagePath}login-illustration.svg`, 
  logo: `${imagePath}logo.svg`, 
  logoSider: `${imagePath}sider-bar-logo.svg`, 
};
