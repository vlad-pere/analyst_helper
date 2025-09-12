import React, { useRef, useState, useMemo } from 'react';
import ExportControls from './ExportControls';
import ValidationTooltip from './ValidationTooltip';

// --- МОЗГ ВАЛИДАЦИИ: Функция, которая ищет ошибки ---
const validateUseCase = (useCase) => {
    const errors = [];
    const mainStepIds = new Set(useCase.mainScenario.map(step => step.id));

    // Проверка обязательных полей
    if (!useCase.purpose?.trim()) errors.push("Поле 'Назначение сценария' не заполнено.");
    if (!useCase.actors?.trim()) errors.push("Поле 'Участники сценария' не заполнено.");
    if (!useCase.successCriteria?.trim()) errors.push("Поле 'Критерии успешности' не заполнено.");

    // Проверка основного сценария
    if (useCase.mainScenario.length === 0) {
        errors.push("Основной сценарий должен содержать хотя бы один шаг.");
    }
    useCase.mainScenario.forEach((step, index) => {
        if (!step.text?.trim()) errors.push(`Основной сценарий: Шаг ${index + 1} пуст.`);
    });

    // Проверка альтернативных сценариев
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

function UseCasePreview({ useCase }) {
    const previewRef = useRef(null);
    const validationIndicatorRef = useRef(null); // Ref для иконки-индикатора
    const [copyButtonText, setCopyButtonText] = useState('Копировать в буфер');

    // Состояния для управления подсказкой через портал
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const validationErrors = useMemo(() => validateUseCase(useCase), [useCase]);

    // Обработчики для показа/скрытия подсказки
    const handleMouseEnter = () => {
        if (validationIndicatorRef.current) {
            const rect = validationIndicatorRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.bottom, // Позиционируем по нижнему краю иконки
                left: rect.left + rect.width / 2, // Центрируем по горизонтали
            });
        }
        setIsTooltipOpen(true);
    };

    const handleMouseLeave = () => setIsTooltipOpen(false);

    const handleCopyToClipboard = async () => {
        if (!previewRef.current) return;
        const htmlContent = previewRef.current.outerHTML;
        try {
            // ClipboardItem может не поддерживаться во всех браузерах
            const blob = new Blob([htmlContent], { type: 'text/html' });
            // eslint-disable-next-line no-undef
            await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
            setCopyButtonText('Скопировано!');
            setTimeout(() => setCopyButtonText('Копировать в буфер'), 2000);
        } catch (err) {
            console.warn("Копирование как Rich Text не удалось, пробую как простой текст. Ошибка:", err);
            try {
                await navigator.clipboard.writeText(htmlContent);
                setCopyButtonText('Скопировано!');
                setTimeout(() => setCopyButtonText('Копировать в буфер'), 2000);
            } catch (fallbackErr) {
                console.error('Не удалось скопировать даже как простой текст:', fallbackErr);
                setCopyButtonText('Ошибка!');
                setTimeout(() => setCopyButtonText('Копировать в буфер'), 2000);
                alert("Не удалось скопировать в буфер обмена. Пожалуйста, проверьте консоль на наличие ошибок и разрешения для сайта.");
            }
        }
    };

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
                        ref={validationIndicatorRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className={`validation-indicator ${validationErrors.length > 0 ? 'error' : 'ok'}`}>
                            {validationErrors.length > 0 ? validationErrors.length : '✓'}
                        </div>
                    </div>
                </div>
                <ExportControls onCopy={handleCopyToClipboard} copyButtonText={copyButtonText} />
            </div>

            <ValidationTooltip
                isOpen={isTooltipOpen}
                errors={validationErrors}
                position={tooltipPosition}
            />

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