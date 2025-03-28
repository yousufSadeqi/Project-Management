import React from 'react'
import Navbar from './components/Navbar'

type Props = {
  children: React.ReactNode; // Corrected type
}

const DashboardWrapper = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {/* sidebar */}
      sidebar
      <main className="dark:bg-dark-bg flex w-full flex-col bg-gray-50 md:pl-64">
        <Navbar /> {/* Render the Navbar */}
        {children} {/* Render the children here */}
      </main>
    </div>
  )
}

export default DashboardWrapper;
