import { Link } from "react-router";
import { SubscriptionItem } from "@components/Dashboard"
import type { Subscription } from "@sdk/db";
interface SubscriptionOptions{
  subs?:Subscription[]
}
export const Subscriptions = ({subs = []}:SubscriptionOptions )=> {

  return (
    <div className="w-full h-full p-4 sm:p-6 md:p-8 bg-white rounded-[2rem] border border-zinc-200 shadow-sm">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h1 className="text-brand-green text-lg sm:text-xl font-bold">Upcoming Subscriptions</h1>
            <Link
              to="/subscriptions" 
              className="text-sm text-brand-green hover:text-brand-green/80 transition-colors font-medium"
            >
              View All
            </Link>
        </div>
        {/* List of subscriptions - responsive grid (shifting from flex)*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {subs.map((item) => (
                <SubscriptionItem 
                  key={item.id} 
                  name={item.name} 
                  amount={item.currency === "USD" ? `${(item.amount ?? 0).toFixed(2)}` : `${(item.amount ?? 0).toFixed(2)} ${item.currency}` }
                  date={item.next_billing_date ? new Date(item.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"} 
                />
            ))}
        </div>
    </div>
  )
}
