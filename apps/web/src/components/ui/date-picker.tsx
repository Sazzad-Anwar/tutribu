import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '../../lib/utils'

type Props = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    onChange(value)
  }, [value])

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        ref={ref}
        onClick={() => setOpen(true)}
        className={cn('flex items-center justify-between', className)}
      >
        <span>{value ? value.toLocaleDateString() : 'Select date'}</span>
        <ChevronDownIcon className="text-[#0000001A]" />
      </PopoverTrigger>
      <PopoverContent
        style={{
          width: ref.current?.clientWidth,
        }}
        className="w-auto overflow-hidden p-0 flex justify-center"
        align="center"
      >
        <Calendar
          mode="single"
          selected={value}
          className="w-full"
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
