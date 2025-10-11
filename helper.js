function getOffset(listPerPage, currentPage = 1) {
    return (currentPage - 1) * [listPerPage];
  }
  
  function emptyOrRows(rows) {
    if (!rows) {
      return [];
    }
    return rows;
  }
  
  function emptyOrData(data) {
      if (!data) {
          return {};
      }
      return data;
  }
  
  module.exports = {
    getOffset,
    emptyOrRows,
    emptyOrData
  }
  