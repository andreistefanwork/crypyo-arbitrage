export const withdrawABI = [
    {
        'inputs': [
            {
                'internalType': 'contract IERC20',
                'name': 'token',
                'type': 'address'
            }
        ],
        'name': 'withdraw',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    }
];

export const initFlashLoanEmpoweredArbitrageABI = [
    {
        'inputs': [
            {
                'internalType': 'address',
                'name': 'flashLoanToken',
                'type': 'address'
            },
            {
                'internalType': 'uint256',
                'name': 'flashLoanAmount',
                'type': 'uint256'
            },
            {
                'internalType': 'bytes',
                'name': 'data',
                'type': 'bytes'
            }
        ],
        'name': 'initFlashLoanEmpoweredArbitrage',
        'outputs': [],
        'stateMutability': 'nonpayable',
        'type': 'function'
    }
];
