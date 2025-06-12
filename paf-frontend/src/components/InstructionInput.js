import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

const InstructionInput = ({ instructions, onChange, showRadio = false, selectedIdx, onRadioChange }) => {
  const handleInstructionChange = (idx, value) => {
    const updated = [...instructions];
    updated[idx] = value;
    onChange(updated.filter(i => i.trim() !== ''));
  };

  const handleAdd = () => {
    onChange([...instructions, '']);
  };

  const handleRemove = (idx) => {
    const updated = instructions.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div>
      {instructions.map((instruction, idx) => (
        <Row className="mb-2" key={idx}>
          {showRadio && (
            <Col xs={1} className="d-flex align-items-center justify-content-center">
              <Form.Check
                type="radio"
                name="instruction-radio"
                checked={selectedIdx === idx}
                onChange={() => onRadioChange(idx)}
                aria-label={`Select step ${idx + 1}`}
                style={{ marginRight: 0 }}
              />
            </Col>
          )}
          <Col xs={showRadio ? 9 : 10}>
            <Form.Control
              type="text"
              value={instruction}
              placeholder={`Step ${idx + 1}`}
              onChange={e => handleInstructionChange(idx, e.target.value)}
              autoFocus={instructions.length - 1 === idx}
            />
          </Col>
          <Col xs={2} className="d-flex align-items-center">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemove(idx)}
              tabIndex={-1}
              aria-label="Remove step"
            >
              <FaTrash />
            </Button>
          </Col>
        </Row>
      ))}
      <Button variant="outline-primary" size="sm" onClick={handleAdd} className="mt-2">
        <FaPlus className="me-1" /> Add Step
      </Button>
    </div>
  );
};

export default InstructionInput;
