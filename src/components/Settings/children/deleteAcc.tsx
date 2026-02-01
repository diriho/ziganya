import SettingsSection from '../settinSection'


const DeleteAcc = () => {
  return (
    <SettingsSection title='Security' description='Manage your password and account security settings.'>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#063b1e] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            {/* return (
                <button 
                onClick={() => isConfirming ? handleDelete() : setIsConfirming(true)}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${isConfirming ? 'bg-red-600 text-white hover:bg-red-700' : 'border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                >
                {isConfirming ? 'Confirm Delete' : 'Delete Account'}
                </button>
  ); */}

        </div>
    </SettingsSection>
  )
}

export default DeleteAcc;