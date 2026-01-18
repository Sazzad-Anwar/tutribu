import { cors } from '@elysiajs/cors'
import openapi from '@elysiajs/openapi'
import { env } from '@tutribu/env/server'
import { Elysia } from 'elysia'
import { AuthModule } from './modules/auth'
import { BookingModule } from './modules/booking'
import { PromoCodeModule } from './modules/promo-code'

new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    }),
  )
  .use(
    openapi({
      scalar: {
        theme: 'elysiajs',
        hideClientButton: true,
        showSidebar: true,
        showDeveloperTools: 'never',
        showToolbar: 'never',
        operationTitleSource: 'summary',
        persistAuth: true,
        telemetry: false,
        layout: 'modern',
        isEditable: false,
        isLoading: false,
        hideModels: false,
        documentDownloadType: 'both',
        hideTestRequestButton: false,
        hideSearch: false,
        showOperationId: false,
        hideDarkModeToggle: false,
        withDefaultFonts: true,
        defaultOpenAllTags: false,
        expandAllModelSections: false,
        expandAllResponses: false,
        orderSchemaPropertiesBy: 'alpha',
        orderRequiredPropertiesFirst: true,
        _integration: 'elysiajs',
        default: false,
        slug: 'Tutribu API',
        title: 'Tutribu API Docs',
      },
      documentation: {
        info: {
          title: 'Tutribu API',
          description: 'API documentation for Tutribu',
          version: '1.0.0',
        },
      },
    }),
  )
  .use(AuthModule)
  .use(BookingModule)
  .use(PromoCodeModule)
  .listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
  })
