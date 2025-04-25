const plantDataMock = [];

const save = async (plantData) => {
  plantDataMock.push(plantData);
};

const getLatest = async () => {
  return plantDataMock.length > 0
    ? plantDataMock[plantDataMock.length - 1]
    : null;
};

export default { save, getLatest };
