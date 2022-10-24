export const EllipsisMiddle = (account) => {
  return account ? account.slice(0, 6) + "..." + account.slice(-6) : "";
};
