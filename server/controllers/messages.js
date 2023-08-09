const getMessages = (req, res) => {
  const selectedUserId = req.params;
  console.log(selectedUserId);
  res.status(200).json({ msg: selectedUserId });
};

module.exports = { getMessages };
