import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';
import { useEmployeeStore } from '../store/employee';
import NewEmployeeModal from '../components/NewEmployeeModal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const Employees = () => {
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { employees, fetchEmployees, isLoading } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employees" 
        buttonLabel="Add Employee"
        onButtonClick={() => setIsNewEmployeeModalOpen(true)}
      />

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="font-medium text-gray-500">Employee</div>
          <div className="font-medium text-gray-500">Role</div>
          <div className="font-medium text-gray-500">Email</div>
          <div className="font-medium text-gray-500">Phone</div>
          <div className="font-medium text-gray-500">Status</div>
          <div className="font-medium text-gray-500">Join Date</div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No employees found</div>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="font-medium">{employee.name}</div>
              <div className="capitalize">{employee.role}</div>
              <div className="text-gray-500">{employee.email}</div>
              <div className="text-gray-500">{employee.phone}</div>
              <div>
                <StatusBadge
                  status={employee.status}
                  variant={employee.status === 'active' ? 'success' : 'error'}
                />
              </div>
              <div className="text-gray-500">{employee.joinDate}</div>
            </div>
          ))
        )}
      </div>

      <NewEmployeeModal
        isOpen={isNewEmployeeModalOpen}
        onClose={() => setIsNewEmployeeModalOpen(false)}
      />
    </div>
  );
};

export default Employees;