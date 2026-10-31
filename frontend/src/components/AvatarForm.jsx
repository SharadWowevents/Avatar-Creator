import React, { useState } from 'react';

const AvatarForm = ({ onSubmit }) => {
  // State for all 5 form fields
  const [formData, setFormData] = useState({
    fieldOne: '',
    fieldTwo: '',
    fieldThree: '',
    fieldFour: '',
    fieldFive: '', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="avatar-form-container">
      <h2>Create Your Avatar</h2>
      
      {/* Rely on form onSubmit to trigger HTML5 required validation */}
      <form onSubmit={handleSubmit}>
        
        {/* Field 1 - Mandatory */}
        <div className="form-group">
          <label htmlFor="fieldOne">Field 1:</label>
          <input
            type="text"
            id="fieldOne"
            name="fieldOne"
            value={formData.fieldOne}
            onChange={handleChange}
            required 
          />
        </div>

        {/* Field 2 - Mandatory */}
        <div className="form-group">
          <label htmlFor="fieldTwo">Field 2:</label>
          <input
            type="email"
            id="fieldTwo"
            name="fieldTwo"
            value={formData.fieldTwo}
            onChange={handleChange}
            required 
          />
        </div>

        {/* Field 3 - Mandatory */}
        <div className="form-group">
          <label htmlFor="fieldThree">Field 3:</label>
          <select
            id="fieldThree"
            name="fieldThree"
            value={formData.fieldThree}
            onChange={handleChange}
            required 
          >
            <option value="" disabled>Select option...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        </div>

        {/* Field 4 - Mandatory */}
        <div className="form-group">
          <label htmlFor="fieldFour">Field 4:</label>
          <input
            type="color"
            id="fieldFour"
            name="fieldFour"
            value={formData.fieldFour}
            onChange={handleChange}
            required 
          />
        </div>

        {/* Field 5 - Mandatory */}
        <div className="form-group">
          <label htmlFor="fieldFive">Field 5 (The Missing Field):</label>
          <input
            type="text"
            id="fieldFive"
            name="fieldFive"
            value={formData.fieldFive}
            onChange={handleChange}
            required 
          />
        </div>

        <button type="submit">Generate Avatar</button>
      </form>
    </div>
  );
};

export default AvatarForm;
