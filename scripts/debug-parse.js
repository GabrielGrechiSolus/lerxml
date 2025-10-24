const fs = require('fs');
const xml2js = require('xml2js');

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<ans:guiaMonitoramento xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
	<ans:tipoRegistro/>
	<ans:versaoTISSPrestador>025</ans:versaoTISSPrestador>
	<ans:formaEnvio>1</ans:formaEnvio>
	<ans:dadosContratadoExecutante>
		<ans:CNES>7015003</ans:CNES>
		<ans:identificadorExecutante>1</ans:identificadorExecutante>
		<ans:codigoCNPJ_CPF>00697509000135</ans:codigoCNPJ_CPF>
		<ans:municipioExecutante>1100122</ans:municipioExecutante>
	</ans:dadosContratadoExecutante>
	<ans:dadosBeneficiario>
		<ans:identBeneficiario>
			<ans:numeroCartaoNacionalSaude>702809193690960</ans:numeroCartaoNacionalSaude>
			<ans:cpfBeneficiario>59558440230</ans:cpfBeneficiario>
			<ans:sexo>3</ans:sexo>
			<ans:dataNascimento>1940-03-06</ans:dataNascimento>
			<ans:municipioResidencia>1100049</ans:municipioResidencia>
		</ans:identBeneficiario>
		<ans:numeroRegistroPlano>466994121</ans:numeroRegistroPlano>
	</ans:dadosBeneficiario>
	<ans:tipoEventoAtencao>2</ans:tipoEventoAtencao>
	<ans:origemEventoAtencao>1</ans:origemEventoAtencao>
	<ans:numeroGuia_prestador>10608157</ans:numeroGuia_prestador>
	<ans:numeroGuia_operadora>10608157</ans:numeroGuia_operadora>
	<ans:identificacaoReembolso>00000000000000000000</ans:identificacaoReembolso>
	<ans:dataSolicitacao>2025-06-05</ans:dataSolicitacao>
	<ans:dataAutorizacao>2025-06-05</ans:dataAutorizacao>
	<ans:dataRealizacao>2025-06-05</ans:dataRealizacao>
	<ans:dataProtocoloCobranca>2025-07-31</ans:dataProtocoloCobranca>
	<ans:dataProcessamentoGuia>2025-07-31</ans:dataProcessamentoGuia>
	<ans:cboExecutante>225125</ans:cboExecutante>
	<ans:indicacaoRecemNato>N</ans:indicacaoRecemNato>
	<ans:indicacaoAcidente>9</ans:indicacaoAcidente>
	<ans:caraterAtendimento>2</ans:caraterAtendimento>
	<ans:tipoAtendimento>03</ans:tipoAtendimento>
	<ans:regimeAtendimento>02</ans:regimeAtendimento>
	<ans:valoresGuia>
		<ans:valorTotalInformado>2077.95</ans:valorTotalInformado>
		<ans:valorProcessado>2077.95</ans:valorProcessado>
		<ans:valorTotalPagoProcedimentos>0.0</ans:valorTotalPagoProcedimentos>
		<ans:valorTotalDiarias>0.0</ans:valorTotalDiarias>
		<ans:valorTotalTaxas>0.0</ans:valorTotalTaxas>
		<ans:valorTotalMateriais>2004.96</ans:valorTotalMateriais>
		<ans:valorTotalOPME>72.99</ans:valorTotalOPME>
		<ans:valorTotalMedicamentos>0.0</ans:valorTotalMedicamentos>
		<ans:valorGlosaGuia>0.0</ans:valorGlosaGuia>
		<ans:valorPagoGuia>2077.95</ans:valorPagoGuia>
		<ans:valorPagoFornecedores>0.0</ans:valorPagoFornecedores>
		<ans:valorTotalTabelaPropria>0.0</ans:valorTotalTabelaPropria>
		<ans:valorTotalCoParticipacao>623.38</ans:valorTotalCoParticipacao>
	</ans:valoresGuia>
	<ans:procedimentos>
		<ans:identProcedimento>
			<ans:codigoTabela>63</ans:codigoTabela>
			<ans:Procedimento>
				<ans:grupoProcedimento>029</ans:grupoProcedimento>
			</ans:Procedimento>
		</ans:identProcedimento>
		<ans:quantidadeInformada>306.0000</ans:quantidadeInformada>
		<ans:valorInformado>2004.96</ans:valorInformado>
		<ans:quantidadePaga>306.0000</ans:quantidadePaga>
		<ans:valorPagoProc>2004.96</ans:valorPagoProc>
		<ans:valorPagoFornecedor>0.0</ans:valorPagoFornecedor>
		<ans:valorCoParticipacao>601.48</ans:valorCoParticipacao>
	</ans:procedimentos>
	<ans:procedimentos>
		<ans:identProcedimento>
			<ans:codigoTabela>00</ans:codigoTabela>
			<ans:Procedimento>
				<ans:codigoProcedimento>93674289</ans:codigoProcedimento>
			</ans:Procedimento>
		</ans:identProcedimento>
		<ans:quantidadeInformada>1.0000</ans:quantidadeInformada>
		<ans:valorInformado>72.99</ans:valorInformado>
		<ans:quantidadePaga>1.0000</ans:quantidadePaga>
		<ans:valorPagoProc>72.99</ans:valorPagoProc>
		<ans:valorPagoFornecedor>0.0</ans:valorPagoFornecedor>
		<ans:valorCoParticipacao>21.9</ans:valorCoParticipacao>
	</ans:procedimentos>
</ans:guiaMonitoramento>`;

const parser = new xml2js.Parser({ explicitArray: false });

parser.parseStringPromise(sampleXml).then((result) => {
  console.log('Parsed root keys:', Object.keys(result));
  const guia = result['ans:guiaMonitoramento'] || result['guiaMonitoramento'] || result;
  console.log('Guia keys:', Object.keys(guia));
  console.log('valoresGuia:', guia['ans:valoresGuia'] || guia['valoresGuia']);
  console.log('procedimentos:', guia['ans:procedimentos'] || guia['procedimentos']);

  // find valorPagoProc in procedimentos
  const procedimentos = guia['ans:procedimentos'] || guia['procedimentos'];
  console.log('procedimentos type:', Array.isArray(procedimentos) ? 'array' : typeof procedimentos);

  const procsArray = Array.isArray(procedimentos) ? procedimentos : [procedimentos];
  const valores = procsArray.map(p => p['ans:valorPagoProc'] || p['valorPagoProc']);
  console.log('valores raw', valores);
  const sum = valores.reduce((acc, v) => acc + parseFloat(String(v || 0)), 0);
  console.log('sum', sum);
}).catch(err => console.error(err));
