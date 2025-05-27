import React, { useState } from 'react';

interface RequirementsTableProps {
  requirements: any[];
  onRequirementsChange: (requirements: any[]) => void;
}

const RequirementsTable: React.FC<RequirementsTableProps> = ({ 
  requirements, 
  onRequirementsChange 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRequirement, setEditedRequirement] = useState<any>(null);

  const handleEdit = (req: any) => {
    setEditingId(req.id);
    setEditedRequirement({ ...req });
  };

  const handleSave = () => {
    if (!editedRequirement) return;
    
    const updatedRequirements = requirements.map(req => 
      req.id === editedRequirement.id ? editedRequirement : req
    );
    
    onRequirementsChange(updatedRequirements);
    setEditingId(null);
    setEditedRequirement(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedRequirement(null);
  };

  const handleChange = (field: string, value: string) => {
    if (!editedRequirement) return;
    
    setEditedRequirement({
      ...editedRequirement,
      [field]: value
    });
  };

  const criticalityOptions = ['Mandatory', 'Recommended', 'Optional', 'Nice-to-Have'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Page
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Criticality
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deadline
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requirements.map((req) => (
            <tr key={req.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {req.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {editingId === req.id ? (
                  <textarea
                    value={editedRequirement?.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                ) : (
                  req.description
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingId === req.id ? (
                  <input
                    type="text"
                    value={editedRequirement?.pageReference}
                    onChange={(e) => handleChange('pageReference', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  req.pageReference
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingId === req.id ? (
                  <select
                    value={editedRequirement?.criticality}
                    onChange={(e) => handleChange('criticality', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {criticalityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.criticality === 'Mandatory' 
                      ? 'bg-red-100 text-red-800' 
                      : req.criticality === 'Recommended'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {req.criticality}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingId === req.id ? (
                  <input
                    type="text"
                    value={editedRequirement?.deadline || ''}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., June 30, 2025"
                  />
                ) : (
                  req.deadline || 'N/A'
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {editingId === req.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(req)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequirementsTable;
