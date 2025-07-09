import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Calendar, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const cards = [
  {
    title: "Total Candidates",
    icon: Users,
    amount: "1,248",
    description: "+20.1% from last month",
    trend: "up",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Active Jobs",
    icon: Briefcase,
    amount: "42",
    description: "+8.2% from last month",
    trend: "up",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Interviews Scheduled",
    icon: Calendar,
    amount: "68",
    description: "+12.5% from last month",
    trend: "up",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Positions Filled",
    icon: CheckCircle,
    amount: "18",
    description: "+5.4% from last month",
    trend: "up",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
]

export function OverviewCards() {
  return (
    <>
      {cards.map((card) => (
        <Card key={card.title} className="glass-card border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">{card.title}</CardTitle>
            <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", card.bgColor)}>
              <card.icon className={cn("h-5 w-5", `text-${card.color.split('-')[1]}-600 dark:text-${card.color.split('-')[1]}-400`)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{card.amount}</div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                card.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {card.trend === "up" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mr-1 h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mr-1 h-4 w-4 transform rotate-180"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {card.description.split(" ")[0]}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
