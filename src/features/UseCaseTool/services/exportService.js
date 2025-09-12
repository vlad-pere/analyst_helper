import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx';
import slugify from 'slugify';

// --- Helper Functions ---

const sanitizeFilename = (name) => {
  if (!name) return 'use-case';
  return slugify(name, { lower: true, strict: true });
};

const downloadFile = (blob, filename) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const getStepDescription = (useCase, stepId) => {
    if (!stepId) return '';
    const step = useCase.mainScenario.find(s => s.id === stepId);
    if (!step) return '';
    const index = useCase.mainScenario.findIndex(s => s.id === stepId);
    return `Шаг ${index + 1}: "${step.text}"`;
};

const renderMultiline = (text) => (text || '').split('\n');
const renderMultilineForMarkdown = (text) => (text || '').split('\n').join('<br>');

// --- HTML / Confluence Generator ---

const generateHtmlContent = (useCase) => {
    const tableRows = [];

    tableRows.push(`<tr><td>Назначение сценария (Цель)</td><td>${useCase.purpose || ''}</td></tr>`);
    if (useCase.preconditions) tableRows.push(`<tr><td>Ограничения сценария (Предусловия)</td><td>${renderMultiline(useCase.preconditions).join('<br>')}</td></tr>`);
    tableRows.push(`<tr><td>Участники сценария</td><td>${renderMultiline(useCase.actors).join('<br>')}</td></tr>`);

    if (useCase.mainScenario.length > 0) {
        tableRows.push(`<tr><td colspan="2" style="background-color: #f0f2f5; font-weight: bold;">Основной сценарий</td></tr>`);
        useCase.mainScenario.forEach((step, index) => {
            const branchingScenarios = useCase.alternativeScenarios.filter(sc => sc.startsAtStepId === step.id);
            const branchingHtml = branchingScenarios.length > 0 
                ? `<div style="font-style: italic; color: #5e6c84; font-size: 0.9em; margin-top: 5px;">${branchingScenarios.map(sc => `→ См. Альтернативный сценарий: "${sc.name}"`).join('<br>')}</div>`
                : '';
            tableRows.push(`<tr><td style="width: 50px; text-align: left; vertical-align: top; font-weight: 600; background-color: #fafbfc;">${index + 1}.</td><td>${step.text || ' '}${branchingHtml}</td></tr>`);
        });
    }

    useCase.alternativeScenarios.forEach((sc, index) => {
        const mainStepIndex = useCase.mainScenario.findIndex(step => step.id === sc.startsAtStepId);
        tableRows.push(`<tr><td colspan="2" style="background-color: #f0f2f5; font-weight: bold;">Альтернативный сценарий #${index + 1}: ${sc.name}</td></tr>`);
        if (sc.startsAtStepId) tableRows.push(`<tr><td>Начинается после</td><td>${getStepDescription(useCase, sc.startsAtStepId)}</td></tr>`);
        
        sc.steps.forEach((step, stepIndex) => {
            const stepNumber = mainStepIndex !== -1 ? `${mainStepIndex + 1}${String.fromCharCode(97 + stepIndex)}.` : `${stepIndex + 1}.`;
            tableRows.push(`<tr><td style="width: 50px; text-align: left; vertical-align: top; font-weight: 600; background-color: #fafbfc;">${stepNumber}</td><td>${step.text || ' '}</td></tr>`);
        });
        if (sc.steps.length === 0) tableRows.push(`<tr><td>-</td><td><em>Нет шагов</em></td></tr>`);
        
        if (sc.returnsToStepId) {
            const returnText = sc.returnsToStepId === 'ends' ? '→ Сценарий завершается' : `→ Возврат к Основному сценарию (${getStepDescription(useCase, sc.returnsToStepId)})`;
            tableRows.push(`<tr><td colspan="2"><div style="margin-top: 15px; font-weight: bold; font-style: italic; color: #5e6c84;">${returnText}</div></td></tr>`);
        }
    });

    if (useCase.postconditions) tableRows.push(`<tr><td>Примечание (Постусловия)</td><td>${renderMultiline(useCase.postconditions).join('<br>')}</td></tr>`);
    tableRows.push(`<tr><td>Критерии успешности (Результат)</td><td>${renderMultiline(useCase.successCriteria).join('<br>')}</td></tr>`);

    return `
        <meta charset='UTF-8'>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            td { border: 1px solid #dfe1e6; padding: 12px; vertical-align: top; word-wrap: break-word; }
            td:first-child { width: 30%; font-weight: 600; background-color: #fafbfc; }
        </style>
        <table border="1">${tableRows.join('')}</table>
    `;
};

// --- Markdown Generator ---

const generateMarkdownContent = (useCase) => {
    const lines = [];
    
    lines.push('|||');
    lines.push('|---|---|');
    lines.push(`| **Назначение сценария (Цель)** | ${useCase.purpose || ''} |`);
    if (useCase.preconditions) lines.push(`| **Ограничения сценария (Предусловия)** | ${renderMultilineForMarkdown(useCase.preconditions)} |`);
    lines.push(`| **Участники сценария** | ${renderMultilineForMarkdown(useCase.actors)} |`);

    if (useCase.mainScenario.length > 0) {
        lines.push('| **Основной сценарий** | |');
        useCase.mainScenario.forEach((step, index) => {
            const branchingScenarios = useCase.alternativeScenarios.filter(sc => sc.startsAtStepId === step.id);
            const branchingText = branchingScenarios.map(sc => `→ *См. Альтернативный сценарий: "${sc.name}"*`).join('<br>');
            const stepContent = `${step.text || ''}${branchingText ? `<br>${branchingText}` : ''}`;
            lines.push(`| ${index + 1}. | ${stepContent} |`);
        });
    }

    useCase.alternativeScenarios.forEach((sc, index) => {
        lines.push(`| **Альтернативный сценарий #${index + 1}: ${sc.name}** | |`);
        if (sc.startsAtStepId) {
            lines.push(`| *Начинается после* | ${getStepDescription(useCase, sc.startsAtStepId)} |`);
        }
        
        const mainStepIndex = useCase.mainScenario.findIndex(step => step.id === sc.startsAtStepId);
        if (sc.steps.length > 0) {
            sc.steps.forEach((step, stepIndex) => {
                const stepNumber = mainStepIndex !== -1 ? `${mainStepIndex + 1}${String.fromCharCode(97 + stepIndex)}.` : `${stepIndex + 1}.`;
                lines.push(`| *${stepNumber}* | ${step.text || ''} |`);
            });
        } else {
            lines.push(`| - | *Нет шагов* |`);
        }

        if (sc.returnsToStepId) {
            const returnText = sc.returnsToStepId === 'ends' ? '→ **Сценарий завершается**' : `→ **Возврат к Основному сценарию** (${getStepDescription(useCase, sc.returnsToStepId)})`;
            lines.push(`| | ${returnText} |`);
        }
    });

    if (useCase.postconditions) lines.push(`| **Примечание (Постусловия)** | ${renderMultilineForMarkdown(useCase.postconditions)} |`);
    lines.push(`| **Критерии успешности (Результат)** | ${renderMultilineForMarkdown(useCase.successCriteria)} |`);

    return lines.join('\n');
};

// --- DOCX Generator ---

const generateDocx = async (useCase) => {
    const createCell = (text, isHeader = false, isStepNumber = false) => {
        return new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text, bold: isHeader })],
            })],
            shading: isHeader ? { fill: "FAFAFA", type: ShadingType.CLEAR, color: "auto" } : undefined,
            width: isStepNumber ? { size: 8, type: WidthType.PERCENTAGE } : undefined,
        });
    };
    
    const createHeaderRow = (text) => {
        return new TableRow({
            children: [new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, bold: true })]})],
                columnSpan: 2,
                shading: { fill: "F0F2F5", type: ShadingType.CLEAR, color: "auto" },
            })],
        });
    };

    const tableRows = [
        new TableRow({ children: [createCell('Назначение сценария (Цель)', true), createCell(useCase.purpose)] }),
    ];

    if (useCase.preconditions) tableRows.push(new TableRow({ children: [createCell('Ограничения сценария (Предусловия)', true), new TableCell({ children: renderMultiline(useCase.preconditions).map(t => new Paragraph(t)) })] }));
    tableRows.push(new TableRow({ children: [createCell('Участники сценария', true), new TableCell({ children: renderMultiline(useCase.actors).map(t => new Paragraph(t)) })] }));

    if (useCase.mainScenario.length > 0) {
        tableRows.push(createHeaderRow('Основной сценарий'));
        useCase.mainScenario.forEach((step, index) => {
            const branchingScenarios = useCase.alternativeScenarios.filter(sc => sc.startsAtStepId === step.id);
            const branchingRuns = branchingScenarios.flatMap(sc => [
                new TextRun({ text: `→ См. Альтернативный сценарий: "${sc.name}"`, italics: true, break: 1 }),
            ]);
            tableRows.push(new TableRow({ children: [
                createCell(`${index + 1}.`, false, true),
                new TableCell({ children: [new Paragraph({ children: [new TextRun(step.text || ' '), ...branchingRuns] })] }),
            ]}));
        });
    }

    useCase.alternativeScenarios.forEach((sc, index) => {
        tableRows.push(createHeaderRow(`Альтернативный сценарий #${index + 1}: ${sc.name}`));
        if (sc.startsAtStepId) tableRows.push(new TableRow({ children: [createCell('Начинается после', true), createCell(getStepDescription(useCase, sc.startsAtStepId))] }));
        
        const mainStepIndex = useCase.mainScenario.findIndex(step => step.id === sc.startsAtStepId);
        sc.steps.forEach((step, stepIndex) => {
            const stepNumber = mainStepIndex !== -1 ? `${mainStepIndex + 1}${String.fromCharCode(97 + stepIndex)}.` : `${stepIndex + 1}.`;
            tableRows.push(new TableRow({ children: [createCell(stepNumber, false, true), createCell(step.text)] }));
        });
        if (sc.steps.length === 0) tableRows.push(new TableRow({ children: [createCell('-', false, true), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Нет шагов', italics: true })]})]})] }));

        if (sc.returnsToStepId) {
            const returnText = sc.returnsToStepId === 'ends' ? '→ Сценарий завершается' : `→ Возврат к Основному сценарию (${getStepDescription(useCase, sc.returnsToStepId)})`;
            tableRows.push(new TableRow({ children: [new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: returnText, bold: true, italics: true })]})],
                columnSpan: 2,
            })]}));
        }
    });

    if (useCase.postconditions) tableRows.push(new TableRow({ children: [createCell('Примечание (Постусловия)', true), new TableCell({ children: renderMultiline(useCase.postconditions).map(t => new Paragraph(t)) })] }));
    tableRows.push(new TableRow({ children: [createCell('Критерии успешности (Результат)', true), new TableCell({ children: renderMultiline(useCase.successCriteria).map(t => new Paragraph(t)) })] }));

    const table = new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: `Use Case: ${useCase.purpose || 'Без названия'}`, heading: HeadingLevel.HEADING_1 }),
                new Paragraph(" "), // Spacer
                table,
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    downloadFile(blob, `${sanitizeFilename(useCase.purpose)}.docx`);
};

// --- Public API ---

export const exportService = {
    copyHtmlToClipboard: async (useCase) => {
        const htmlContent = generateHtmlContent(useCase);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        // eslint-disable-next-line no-undef
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
    },

    copyMarkdownToClipboard: async (useCase) => {
        const mdContent = generateMarkdownContent(useCase);
        await navigator.clipboard.writeText(mdContent);
    },
    
    downloadHtml: (useCase) => {
        const htmlContent = generateHtmlContent(useCase);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        downloadFile(blob, `${sanitizeFilename(useCase.purpose)}.html`);
    },

    downloadMarkdown: (useCase) => {
        const mdContent = generateMarkdownContent(useCase);
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        downloadFile(blob, `${sanitizeFilename(useCase.purpose)}.md`);
    },

    downloadDocx: async (useCase) => {
        await generateDocx(useCase);
    },
};