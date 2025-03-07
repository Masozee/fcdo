import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, LineChart, PieChart, Users, ArrowUpRight, DollarSign, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <Button variant="outline" size="sm">
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,457</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$48,789</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">
              +4 new this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.6%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex aspect-[2/1] items-center justify-center">
            <div className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed">
              <LineChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Revenue Chart</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="flex aspect-square items-center justify-center">
            <div className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed">
              <PieChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Pie Chart</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b border-muted p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="grid flex-1 gap-1">
                <div className="font-medium">New User Registration</div>
                <div className="text-sm text-muted-foreground">Sarah Johnson joined the platform</div>
              </div>
              <div className="text-sm text-muted-foreground">2 mins ago</div>
            </div>
          </div>
          <div className="border-b border-muted p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="grid flex-1 gap-1">
                <div className="font-medium">New Transaction</div>
                <div className="text-sm text-muted-foreground">Project XYZ subscription renewed</div>
              </div>
              <div className="text-sm text-muted-foreground">15 mins ago</div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <div className="grid flex-1 gap-1">
                <div className="font-medium">Project Update</div>
                <div className="text-sm text-muted-foreground">Design Engineering project status changed to "In Progress"</div>
              </div>
              <div className="text-sm text-muted-foreground">1 hour ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
