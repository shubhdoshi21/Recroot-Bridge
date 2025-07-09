"use client"

import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useClickOutside } from "@/hooks/use-click-outside"

export function DateRangePicker({ className }) {
  const [date, setDate] = React.useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [isOpen, setIsOpen] = React.useState(false)
  const calendarRef = React.useRef(null)

  // Handle click outside to close the calendar
  useClickOutside(calendarRef, () => {
    if (isOpen) setIsOpen(false)
  })

  const handleDateChange = (value) => {
    setDate({ from: value[0], to: value[1] })
  }

  return (
    <div className={cn("w-full sm:w-auto relative", className)}>
      <Button
        id="date"
        variant={"outline"}
        className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
            </>
          ) : (
            format(date.from, "LLL dd, y")
          )
        ) : (
          <span>Pick a date</span>
        )}
      </Button>

      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-2 bg-white rounded-md shadow-md border border-gray-200 p-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <Calendar
            selectRange={true}
            value={[date.from, date.to]}
            onChange={handleDateChange}
            className="rounded-md"
            tileClassName="rounded-sm"
            next2Label={null}
            prev2Label={null}
            minDetail="month"
            maxDetail="month"
          />
          <style>{`
            .react-calendar {
              width: 350px;
              max-width: 100%;
              background: inherit;
              border: none;
              font-family: inherit;
              line-height: 1.125em;
            }
            .react-calendar__tile--active {
              background: hsl(var(--primary));
              color: white;
            }
            .react-calendar__tile--active:enabled:hover,
            .react-calendar__tile--active:enabled:focus {
              background: hsl(var(--primary));
            }
            .react-calendar__tile--rangeStart,
            .react-calendar__tile--rangeEnd {
              background: hsl(var(--primary)) !important;
              color: white;
              border-radius: 0.25rem;
            }
            .react-calendar__tile--rangeStart {
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
            }
            .react-calendar__tile--rangeEnd {
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
            .react-calendar__tile--now {
              background: hsl(var(--muted));
            }
            .react-calendar__tile--now:enabled:hover,
            .react-calendar__tile--now:enabled:focus {
              background: hsl(var(--muted-foreground) / 0.3);
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: hsl(var(--accent));
              color: hsl(var(--accent-foreground));
            }
            .react-calendar__month-view__days__day--neighboringMonth {
              color: hsl(var(--muted-foreground));
            }
            .react-calendar__navigation button:disabled {
              background-color: transparent;
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus {
              background-color: hsl(var(--accent));
            }
            .react-calendar__tile--range {
              background: hsl(var(--primary) / 0.2);
              color: hsl(var(--primary));
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

// Also export as DatePicker for backward compatibility
export { DateRangePicker as DatePicker }

// Move the useEffect hook outside the component to avoid conditional hook call
// and ensure calendarRef, isOpen, and setIsOpen are accessible.
