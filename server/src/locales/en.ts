export default {
  text: 'Text',
  validationErrors: {
    invoice: {
      name: 'Name is required',
      status: 'Status is required',
      services: {
        description: 'Description is required',
        amount: 'Amount is required',
      },
    },
  },
  errors: {
    user: {
      accountSettings: {
        update: {
          success: 'Account settings updated successfully',
          badRequest: 'Unable to update account settings',
        },
      },
    },
  },
};
