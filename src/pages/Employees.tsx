import React from 'react';
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const Employees = () => {
  const employees: Employee[] = [
    {
      id: 'EMP001',
      name: 'Sarah Johnson',
      role: 'Manager',
      email: 'sarah.j@restaurant.com',
      phone: '+1 234-567-8903',
      status: 'active',
      joinDate: 'Jan 15, 2024',
    },
    {
      id: 'EMP002',
      name: 'Mike Chen',
      role: 'Chef',
      email: 'mike.c@restaurant.com',
      phone: '+1 234-567-8904',
      status: 'active',
      joinDate: 'Feb 1, 2024',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Add Employee
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="font-medium text-gray-500">Employee</div>
          <div className="font-medium text-gray-500">Role</div>
          <div className="font-medium text-gray-500">Email</div>
          <div className="font-medium text-gray-500">Phone</div>
          <div className="font-medium text-gray-500">Status</div>
          <div className="font-medium text-gray-500">Join Date</div>
        </div>
        {employees.map((employee) => (
          <div key={employee.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="font-medium">{employee.name}</div>
            <div>{employee.role}</div>
            <div className="text-gray-500">{employee.email}</div>
            <div className="text-gray-500">{employee.phone}</div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
            </div>
            <div className="text-gray-500">{employee.joinDate}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employees;