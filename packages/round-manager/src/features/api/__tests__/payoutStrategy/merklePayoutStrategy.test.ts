import { useGroupProjectsByPaymentStatus } from "../../payoutStrategy/merklePayoutStrategy";


describe('useGroupProjectsByPaymentStatus', () => {
  it('SHOULD group projects into paid and unpaid arrays', async () => {

    const roundId = '123';
    const chainId = '1';

    const projects = [
      { projectId: '1', amount: 100, status: 'Unpaid' },
      { projectId: '2', amount: 200, status: 'Paid' },
      { projectId: '3', amount: 300, status: 'Unpaid' },
    ];

    const paidProjectsFromGraph = [{ id: '2' }];

    const useFetchMatchingDistributionFromContract = jest.fn().mockResolvedValue({
      matchingDistributionContract: projects,
    });

    const fetchProjectPaidInARound = jest
      .fn()
      .mockResolvedValue(paidProjectsFromGraph);


    // const result = await useGroupProjectsByPaymentStatus(roundId, chainId, {
    //   useFetchMatchingDistributionFromContract,
    //   fetchProjectPaidInARound,
    // });
  

    // expect(result.paid).toEqual([{ projectId: '2', amount: 200, status: 'Paid' }]);
    // expect(result.unpaid).toEqual([
    //   { projectId: '1', amount: 100, status: 'Unpaid' },
    //   { projectId: '3', amount: 300, status: 'Unpaid' },
    // ]);
    // expect(useFetchMatchingDistributionFromContract).toHaveBeenCalledWith(roundId);
    // expect(fetchProjectPaidInARound).toHaveBeenCalledWith(roundId, chainId);

    
  });
});