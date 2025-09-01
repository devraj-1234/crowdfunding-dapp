export interface Campaign {
  id?: string;
  chainId?: number;
  
  creator: string;  
  title: string;
  description: string;
  goal: string;
  deadline: number;
  pledged: string;
  claimed: boolean;
  calledOff?: boolean;
}
