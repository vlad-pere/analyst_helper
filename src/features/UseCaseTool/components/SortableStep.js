import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Input from '../../../ui-kit/Input/Input';

function SortableStep({ step, index, onStepChange, onDeleteStep }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div className="scenario-step" ref={setNodeRef} style={style} {...attributes}>
      <span className="drag-handle" {...listeners}>&#x2630;</span>
      <span>Шаг {index + 1}:</span>
      <Input type="text" value={step.text} onChange={(e) => onStepChange(step.id, e.target.value)} />
      <button className="delete-step-btn" onClick={() => onDeleteStep(step.id)}>&times;</button>
    </div>
  );
}

export default SortableStep;