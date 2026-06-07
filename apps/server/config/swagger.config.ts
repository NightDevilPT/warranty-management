// src/config/swagger.config.ts
import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Warranty Management System API')
  .setDescription(
    `Complete API documentation for the Warranty Management System\n\n
    ## Authentication
    - This API uses cookie-based authentication
    - Login endpoints will set httpOnly cookies for accessToken and refreshToken
    - All subsequent requests will automatically include these cookies\n\n
    ## 🔑 How to Authenticate in Swagger UI
    1. Execute Login endpoint first
    2. Copy the tokens from the response (check browser console)
    3. Click the 🔒 Authorize button at the top
    4. Paste your accessToken and refreshToken\n\n
    ## Security
    - accessToken: Short-lived authentication token (15-30 minutes)
    - refreshToken: Long-lived token for obtaining new access tokens
    - Both cookies are httpOnly and secure in production
    `,
  )
  .setVersion('1.0')
  .setContact(
    'Support Team',
    'https://support.warranty-system.com',
    'support@warranty-system.com',
  )
  .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
  .addCookieAuth(
    'accessToken',
    {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
      description: 'Access Token (copy from login response)',
    },
    'cookie-auth',
  )
  .addCookieAuth(
    'refreshToken',
    {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh Token (copy from login response)',
    },
    'cookie-auth',
  )
  .addServer(
    `http://localhost:${process.env.PORT || 4000}`,
    'Local Development Server',
  )
  .addServer('https://api.warranty-system.com', 'Production Server')
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true, // Important for cookies
    requestInterceptor: (req: any) => {
      // Log for debugging
      console.log('📤 Request:', req.method, req.url);

      // If tokens are in Swagger's authorization, add them as cookies
      if (req.headers['cookie']) {
        console.log('🍪 Cookies being sent:', req.headers['cookie']);
      }

      req.credentials = 'include';
      return req;
    },
    responseInterceptor: (res: any) => {
      // Log response to help get tokens
      console.log('📥 Response:', res.status, res.url);

      // Check for tokens in response body
      if (res.body) {
        try {
          const body = JSON.parse(res.text || '{}');
          if (body.data?.accessToken || body.accessToken) {
            console.log('🔑 TOKENS FOUND - Copy these:');
            console.log(
              'accessToken:',
              body.data?.accessToken || body.accessToken,
            );
            console.log(
              'refreshToken:',
              body.data?.refreshToken || body.refreshToken,
            );
          }
        } catch (e) {
          // Not JSON response
        }
      }

      return res;
    },
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  customSiteTitle: 'Warranty Management System',
  customfavIcon:
    'https://firebasestorage.googleapis.com/v0/b/file-system-e3b65.appspot.com/o/file-storage-avtar%2Flogo.png?alt=media&token=021e454f-f2fb-4885-9762-90844a76d349',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
  ],
  customCssUrl: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
  ],
};
