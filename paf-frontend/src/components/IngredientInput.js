import React from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaPlus, FaTrash, FaRegDotCircle } from 'react-icons/fa';

const IngredientInput = ({ ingredients, onChange, showRadio = false, selectedIdx, onRadioChange }) => {
  const handleIngredientChange = (idx, value) => {
    const updated = [...ingredients];
    updated[idx] = value;
    onChange(updated.filter(i => i.trim() !== ''));
  };

  const handleAdd = () => {
    onChange([...ingredients, '']);
  };

  const handleRemove = (idx) => {
    const updated = ingredients.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div>
      {ingredients.map((ingredient, idx) => (
        <Row className="mb-2" key={idx}>
          {showRadio && (
            <Col xs={1} className="d-flex align-items-center justify-content-center">
              <Form.Check
                type="radio"
                name="ingredient-radio"
                checked={selectedIdx === idx}
                onChange={() => onRadioChange(idx)}
                aria-label={`Select ingredient ${idx + 1}`}
                style={{ marginRight: 0 }}
              />
            </Col>
          )}
          <Col xs={showRadio ? 9 : 10}>
            <Form.Control
              type="text"
              value={ingredient}
              placeholder={`Ingredient ${idx + 1}`}
              onChange={e => handleIngredientChange(idx, e.target.value)}
              autoFocus={ingredients.length - 1 === idx}
            />
          </Col>
          <Col xs={2} className="d-flex align-items-center">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemove(idx)}
              tabIndex={-1}
              aria-label="Remove ingredient"
            >
              <FaTrash />
            </Button>
          </Col>
        </Row>
      ))}
      <Button variant="outline-primary" size="sm" onClick={handleAdd} className="mt-2">
        <FaPlus className="me-1" /> Add Ingredient
      </Button>
    </div>
  );
};

export default IngredientInput;
