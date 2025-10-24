import { describe, it, expect } from 'vitest';
import { calculateValues } from '../services/calculate';

describe('calculateValues', () => {
  it('calculates totals for XML with ans namespace (happy path)', async () => {
    const xml = `<?xml version="1.0"?>
<ans:guiaMonitoramento xmlns:ans="urn:ans">
  <ans:procedimentos>
    <ans:procedimento>
      <ans:valorPagoProc>10.50</ans:valorPagoProc>
    </ans:procedimento>
    <ans:procedimento>
      <ans:valorPagoProc>5.25</ans:valorPagoProc>
    </ans:procedimento>
  </ans:procedimentos>
  <ans:valoresGuia>
    <ans:valorPagoGuia>15.75</ans:valorPagoGuia>
  </ans:valoresGuia>
</ans:guiaMonitoramento>`;

    const res = await calculateValues(xml);
    expect(res.error).toBeUndefined();
    expect(res.totalValorPagoProc).toBeCloseTo(15.75, 2);
    expect(res.valorPagoGuia).toBeCloseTo(15.75, 2);
    expect(res.areEqual).toBe(true);
    expect(res.valoresProc.length).toBe(2);
  });

  it('handles XML without namespace and comma decimal formats', async () => {
    const xml = `<?xml version="1.0"?>
<guiaMonitoramento>
  <procedimentos>
    <procedimento>
      <valorPagoProc>1.234,56</valorPagoProc>
    </procedimento>
  </procedimentos>
  <valoresGuia>
    <valorPagoGuia>1234,56</valorPagoGuia>
  </valoresGuia>
</guiaMonitoramento>`;

    const res = await calculateValues(xml);
    expect(res.error).toBeUndefined();
    expect(res.totalValorPagoProc).toBeCloseTo(1234.56, 2);
    expect(res.valorPagoGuia).toBeCloseTo(1234.56, 2);
    expect(res.areEqual).toBe(true);
  });

  it('returns error object when guiaMonitoramento missing', async () => {
    const xml = `<root></root>`;
    const res = await calculateValues(xml);
    expect(res.error).toBeDefined();
    expect(res.totalValorPagoProc).toBe(0);
    expect(res.valorPagoGuia).toBe(0);
    expect(res.areEqual).toBe(false);
  });

  it('handles mismatch between procedimentos and valoresGuia', async () => {
    const xml = `<?xml version="1.0"?>
<guiaMonitoramento>
  <procedimentos>
    <procedimento><valorPagoProc>2.00</valorPagoProc></procedimento>
  </procedimentos>
  <valoresGuia>
    <valorPagoGuia>5.00</valorPagoGuia>
  </valoresGuia>
</guiaMonitoramento>`;

    const res = await calculateValues(xml);
    expect(res.error).toBeUndefined();
    expect(res.totalValorPagoProc).toBeCloseTo(2.0, 2);
    expect(res.valorPagoGuia).toBeCloseTo(5.0, 2);
    expect(res.areEqual).toBe(false);
  });
});
