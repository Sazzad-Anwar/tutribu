import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es-MX', label: 'Español (MX)', flag: '🇲🇽' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Button
          variant="link"
          size="sm"
          className="px-2 py-0 m-0 border-0 ring-0 gap-1 text-primary hover:text-brand font-medium"
          aria-label="Switch language"
        >
          <Globe className="size-4" />
          <span className="hidden xl:inline text-base">
            {currentLang.code.toUpperCase()}
          </span>
          <span className="xl:hidden text-sm">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-md w-44"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`cursor-pointer gap-2 ${
              i18n.language === lang.code
                ? 'text-brand font-semibold'
                : 'text-primary'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
