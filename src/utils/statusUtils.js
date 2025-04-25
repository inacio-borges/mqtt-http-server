export const interpretInverterStatus = (statusHex) => {
  const status = parseInt(statusHex, 16);
  const binaryStatus = status.toString(2).padStart(16, "0").split("").reverse();

  const statusTable = [
    ["Controle não pronto", "Controle pronto"],
    ["Drive não pronto", "Drive pronto"],
    ["Em inércia", "Habilitado"],
    ["Sem erro", "Desligamento por falha"],
    ["Sem erro", "Erro (sem desligamento)"],
    ["Reservado", "-"],
    ["Sem erro", "Bloqueio por falha"],
    ["Sem aviso", "Aviso"],
    ["Referência de velocidade #", "Velocidade = referência"],
    ["Operação local", "Controle via barramento"],
    ["Fora do limite de frequência", "Dentro do limite"],
    ["Sem operação", "Em operação"],
    ["Drive OK", "Parado, auto início"],
    ["Tensão OK", "Tensão excedida"],
    ["Torque OK", "Torque excedido"],
    ["Temporizador OK", "Tempo excedido"],
  ];

  return statusTable.map(
    (messages, index) => messages[parseInt(binaryStatus[index], 10)]
  );
};
