export const updateRules = {
  _id: ['string'],
  name: ['sometimes', 'required', 'string', 'min:5', 'max:50'],
  'profile.status': ['sometimes', 'required', 'string', 'min:1', 'max:50'],
  private_account: ['sometimes', 'required', 'boolean'],
};
