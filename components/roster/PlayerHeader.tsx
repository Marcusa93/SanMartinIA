import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '../../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import { Player } from '../../types/database';
import { useState } from 'react';

interface PlayerHeaderProps {
    player: Player;
}

export function PlayerHeader({ player }: PlayerHeaderProps) {
    const [showQR, setShowQR] = useState(false);

    return (
        <Card className="mb-6">
            <CardContent className="flex items-start justify-between gap-6 pt-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-muted-foreground">
                            {player.first_name[0]}{player.last_name[0]}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{player.first_name} {player.last_name}</h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={STATUS_COLORS[player.status]}>{STATUS_LABELS[player.status]}</Badge>
                            {player.position && <Badge variant="muted">{player.position}</Badge>}
                            <span className="font-mono text-xs text-primary font-semibold bg-secondary px-2 py-0.5 rounded">{player.club_player_code}</span>
                        </div>
                        {(player.height_cm || player.weight_kg || player.birthdate) && (
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                {player.height_cm && <span>Altura: {player.height_cm} cm</span>}
                                {player.weight_kg && <span>Peso: {player.weight_kg} kg</span>}
                                {player.birthdate && <span>Nac: {formatDate(player.birthdate)}</span>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors border border-primary/30 px-3 py-1 rounded-lg"
                    >
                        {showQR ? 'Ocultar QR' : '📱 Generar QR'}
                    </button>
                    {showQR && (
                        <div className="bg-white p-2 rounded-lg absolute top-20 right-10 shadow-xl z-50 border border-border">
                            <QRCodeCanvas value={`SMT-PLAYER:${player.club_player_code}:${player.id}`} size={110} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
