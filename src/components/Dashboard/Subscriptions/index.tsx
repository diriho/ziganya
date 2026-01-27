import { SubscriptionItem } from "./SubscriptionItem"

export const Subscriptions = () => {
  const upcomingsubs = [
    {
      name: 'Adobe Creative Cloud',
      date: 'Jan 24',
      amount: '$52.99',
    },
    {
      name: 'ChatGPT Plus',
      date: 'Jan 25',
      amount: '$20.00',
    },
    {
      name: 'Notion AI',
      date: 'Jan 28',
      amount: '$10.00',
    },
    {
      name: 'YouTube Premium',
      date: 'Feb 01',
      amount: '$13.99',
    },
  ]
  
  return (
    <div className="w-full h-full p-4 sm:p-6 md:p-8 bg-white rounded-[2rem] border border-zinc-200 shadow-sm">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h1 className="text-brand-green text-lg sm:text-xl font-bold">Upcoming Subscriptions</h1>
            <a 
              href="/subscriptions" 
              className="text-sm text-brand-green hover:text-brand-green/80 transition-colors font-medium"
            >
              View All
            </a>
        </div>
        {/* List of subscriptions - responsive grid (shifting from flex)*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {upcomingsubs.map((item, index) => (
                <SubscriptionItem 
                  key={index} 
                  name={item.name} 
                  amount={item.amount} 
                  date={item.date}  
                />
            ))}
        </div>
    </div>
  )
}
