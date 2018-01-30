
## Migration

After contract deployment:

1. From  DRC contract  *addMinter(NewICO.address)*
2. From DRX contract *addMinter(NewICO.address)*
3. From PreICO contract *finishSalePeriod()*
4. From PreICO contract *setICO(NewICO.address)*
5. From ICO contract  *setPreICO(preICO.address)*
6. From PreICO contract *transferPreICOUnsoldTokens()*;

//remove Old ICO contract
7. From DRC contract *removeMinter(OldICO.address)*
8. From DRX contract *removeMinter(OldICO.address)*
