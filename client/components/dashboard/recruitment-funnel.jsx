"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, TrendingDown, Users, Target } from "lucide-react"
import { useState } from "react"

const funnelStages = [
  {
    name: "Applications",
    count: 1248,
    percentage: 100,
    color: "bg-blue-500",
    icon: <Users className="h-4 w-4" />,
    description: "Total applications received"
  },
  {
    name: "Screening",
    count: 520,
    percentage: 42,
    color: "bg-indigo-500",
    icon: <Filter className="h-4 w-4" />,
    description: "Passed initial screening"
  },
  {
    name: "Interview",
    count: 215,
    percentage: 17,
    color: "bg-purple-500",
    icon: <Users className="h-4 w-4" />,
    description: "Scheduled for interview"
  },
  {
    name: "Assessment",
    count: 125,
    percentage: 10,
    color: "bg-pink-500",
    icon: <Target className="h-4 w-4" />,
    description: "Completed assessments"
  },
  {
    name: "Offer",
    count: 48,
    percentage: 4,
    color: "bg-orange-500",
    icon: <Target className="h-4 w-4" />,
    description: "Offers extended"
  },
  {
    name: "Hired",
    count: 32,
    percentage: 2.5,
    color: "bg-emerald-500",
    icon: <Users className="h-4 w-4" />,
    description: "Successfully hired"
  },
]

export function RecruitmentFunnel() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4 border-b border-gray-200/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <div className="text-gray-900">Recruitment Funnel</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Candidate conversion pipeline
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {funnelStages.map((stage, index) => (
            <FunnelStage key={stage.name} stage={stage} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelStage({ stage, index }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative space-y-3 transition-all duration-300 hover:bg-white/60 rounded-lg p-3 -m-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stage.color} text-white transition-all duration-300 group-hover:scale-110`}>
            {stage.icon}
          </div>
          <div>
            <span className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-emerald-700">
              {stage.name}
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              {stage.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-bold text-lg text-gray-900 transition-all duration-300 group-hover:scale-105">
            {stage.count.toLocaleString()}
          </span>
          <p className="text-xs text-gray-600">
            {stage.percentage}% of total
          </p>
        </div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200/50">
        <div
          className={`absolute left-0 top-0 h-full ${stage.color} transition-all duration-500 ease-out`}
          style={{
            width: isHovered ? `${stage.percentage}%` : "0%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Conversion rate: {stage.percentage}%</span>
        <span>{stage.percentage}% of total</span>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${stage.color} transform transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  )
}
