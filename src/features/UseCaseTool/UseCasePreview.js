import React, { useRef, useState, useMemo } from 'react';
import ExportControls from './components/ExportControls';
import ValidationTooltip from './ValidationTooltip';

const validateUseCase = (useCase) => {
    const errors = [];
    const mainStepIds = new Set(useCase.mainScenario.map(step => step.id));

    if (!useCase.purpose?.trim()) errors.push("Поле 'Назначение сценария' не заполнено.");
    if (!useCase.actors?.trim()) errors.push("Поле 'Участники сценария' не заполнено.");
    if (!useCase.successCriteria?.trim()) errors.push("Поле 'Критерии успешности' не заполнено.");

    if (useCase.mainScenario.length === 0) {
        errors.push("Основной сценарий должен содержать хотя бы один шаг.");
    }
    useCase.mainScenario.forEach((step, index) => {
        if (!step.text?.trim()) errors.push(`Основной сценарий: Шаг ${index + 1} пуст.`);
    });

    useCase.alternativeScenarios.forEach((sc) => {
        const name = sc.name || 'без названия';
        if (!sc.name?.trim()) errors.push('Альтернативный сценарий: Отсутствует название.');
        if (!sc.startsAtStepId) errors.push(`Альтернативный сценарий "${name}": Не указан шаг начала.`);
        else if (!mainStepIds.has(sc.startsAtStepId)) errors.push(`Альтернативный сценарий "${name}": Шаг начала ссылается на удаленный шаг.`);
        
        if (!sc.returnsToStepId) errors.push(`Альтернативный сценарий "${name}": Не указан шаг возврата или завершения.`);
        else if (sc.returnsToStepId !== 'ends' && !mainStepIds.has(sc.returnsToStepId)) errors.push(`Альтернативный сценарий "${name}": Шаг возврата ссылается на удаленный шаг.`);
    });
    return errors;
};

function UseCasePreview({ useCase, onShowNotification }) {
    const previewRef = useRef(null);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    
    const validationErrors = useMemo(() => validateUseCase(useCase), [useCase]);

    const renderMultilineText = (text) => text ? text.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>) : null;

    const findStepDescription = (stepId) => {
        if (!stepId) return '';
        const step = useCase.mainScenario.find(s => s.id === stepId);
        if (!step) return '';
        const index = useCase.mainScenario.findIndex(s => s.id === stepId);
        return `Шаг ${index + 1}: "${step.text}"`;
    };

    return (
        <div className="preview-panel">
            <div className="preview-header">
                <div className="header-title-wrapper">
                    <h2>Документация</h2>
                    <div
                        className="validation-container"
                        onMouseEnter={() => setIsTooltipOpen(true)}
                        onMouseLeave={() => setIsTooltipOpen(false)}
                    >
                        <div className={`validation-indicator ${validationErrors.length > 0 ? 'error' : 'ok'}`}>
                            {validationErrors.length > 0 ? validationErrors.length : '✓'}
                        </div>
                        <ValidationTooltip
                            isOpen={isTooltipOpen}
                            errors={validationErrors}
                        />
                    </div>
                </div>
                <ExportControls useCase={useCase} onShowNotification={onShowNotification} />
            </div>

            <div className="preview-content-scrollable">
                <div ref={previewRef}>
                    <table className="preview-table">
                        <tbody>
                            <tr><td>Назначение сценария (Цель)</td><td>{useCase.purpose}</td></tr>
                            {useCase.preconditions && (<tr><td>Ограничения сценария (Предусловия)</td><td>{renderMultilineText(useCase.preconditions)}</td></tr>)}
                            <tr><td>Участники сценария</td><td>{renderMultilineText(useCase.actors)}</td></tr>

                            {useCase.mainScenario.length > 0 && (
                                <React.Fragment>
                                    <tr><td colSpan="2" className="scenario-header">Основной сценарий</td></tr>
                                    {useCase.mainScenario.map((step, index) => {
                                        const branchingScenarios = useCase.alternativeScenarios.filter(sc => sc.startsAtStepId === step.id);
                                        return (
                                            <tr key={step.id}>
                                                <td className="step-number-cell">{index + 1}.</td>
                                                <td>{step.text || ' '}{branchingScenarios.length > 0 && (<div className="scenario-link">{branchingScenarios.map(sc => <span key={sc.id}>→ См. Альтернативный сценарий: "{sc.name}"</span>)}</div>)}</td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            )}

                            {useCase.alternativeScenarios.map((sc, index) => {
                                const mainStepIndex = useCase.mainScenario.findIndex(step => step.id === sc.startsAtStepId);
                                return (
                                    <React.Fragment key={sc.id}>
                                        <tr><td colSpan="2" className="scenario-header">Альтернативный сценарий #{index + 1}: {sc.name}</td></tr>
                                        {sc.startsAtStepId && (<tr><td>Начинается после</td><td>{findStepDescription(sc.startsAtStepId)}</td></tr>)}
                                        {sc.steps.map((step, stepIndex) => {
                                            const stepNumber = mainStepIndex !== -1 ? `${mainStepIndex + 1}${String.fromCharCode(97 + stepIndex)}.` : `${stepIndex + 1}.`;
                                            return (<tr key={step.id}><td className="step-number-cell">{stepNumber}</td><td>{step.text || ' '}</td></tr>);
                                        })}
                                        {sc.steps.length === 0 && (<tr><td className="step-number-cell">-</td><td><em>Нет шагов</em></td></tr>)}
                                        {sc.returnsToStepId && (<tr><td colSpan="2"><div className="scenario-link return-link">{sc.returnsToStepId === 'ends' ? <span>→ Сценарий завершается</span> : <span>→ Возврат к Основному сценарию ({findStepDescription(sc.returnsToStepId)})</span>}</div></td></tr>)}
                                    </React.Fragment>
                                );
                            })}

                            {useCase.postconditions && (<tr><td>Примечание (Постусловия)</td><td>{renderMultilineText(useCase.postconditions)}</td></tr>)}
                            <tr><td>Критерии успешности (Результат)</td><td>{renderMultilineText(useCase.successCriteria)}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UseCasePreview;