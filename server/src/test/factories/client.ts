import { Factory } from 'fishery';
import { SelectClient } from '../../database/schema';

export const clientFactory = Factory.define<SelectClient>(({ sequence }) => ({
  id: sequence,
  name: `Test Client ${sequence}`,
  email: `client${sequence}@example.com`,
  address: `${sequence} Client Street`,
  businessNumber: `BN${sequence}`,
  vatNumber: null,
  businessType: 'individual',
  type: 'receiver',
  userId: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));
